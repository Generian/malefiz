// context/SocketContext.tsx
import { useRouter } from "next/router"
import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react"
import { getUuid, handleNewUuid } from "src/utils/helper"
import { useData } from "./DataContext"
import { GameValidityData } from "src/pages/api/socket"
import { socket } from "./socket"
import { ParsedUrlQuery } from "querystring"
import { Socket } from "socket.io-client"

export const isBrowser = typeof window !== "undefined"

// Define the shape of the context
interface SocketContextType {
  socket: Socket | null
}

// Create the context with an initial value of null
const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket?.connected)
  const [transport, setTransport] = useState(
    socket?.io?.engine?.transport?.name
      ? socket.io.engine.transport.name
      : "N/A"
  )

  const { setLobbies, setGames, setGame, setPlayerColor } = useData()

  // Check if the router is available
  const router = typeof window !== "undefined" ? useRouter() : null
  const [hasRouter, setHasRouter] = useState(false)

  useEffect(() => {
    setHasRouter(!!router) // Component will render only on the client
  }, [router])

  useEffect(() => {
    console.log("Socket connection status:", { isConnected, transport })
  }, [isConnected, transport])

  // Start socket connection sequence
  useEffect(() => {
    console.log("Socket useEffect hook start.", socket)

    // Check if the socket object is empty
    if (Object.keys(socket).length === 0) {
      console.log("Socket object is empty. Aborting socket connection.")
      return
    }

    // Check if router is available
    if (!hasRouter) {
      console.log("Router is not available. Aborting socket connection.")
      return
    }

    if (socket.connected) {
      // Execute onConnect just for completeness
      onConnect()
    } else if (!socket.connected) {
      // Fetch socket endpoint to establish connection
      fetch("/api/socket")
    }

    // Event handlers for socket connection
    async function onConnect() {
      console.log("Socket on connect. <------------", socket)
      const { lid } = router?.query as ParsedUrlQuery
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name)
      })

      socket.emit(
        "requestUuid",
        lid,
        getUuid(),
        (newUuid: string, { game, playerColor }: GameValidityData) => {
          handleNewUuid(newUuid)
          setGame(game)
          setPlayerColor(lid, playerColor)
        }
      )

      socket.on("updateLobbies", (lobbies, games) => {
        console.log("Lobbies update:", lobbies)
        setLobbies(lobbies)
        games && setGames(games)
      })

      socket.on("startGame", (lobbyId, uuids) => {
        if (uuids.includes(getUuid())) {
          router && router.push(`/play?lid=${lobbyId}`)
        }
      })

      socket.on("receiveGameUpdate", (game) => {
        game && setGame(game)
      })

      socket.on("playerUpdate", (lobbyId, players) => {
        setGame({ lobbyId, players })
      })
    }

    function onDisconnect() {
      console.warn("Socket disconnected. Socket:", socket)
      setIsConnected(false)
      setTransport("N/A")
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [router])

  if (!socket) return null //Prevent rendering on the server
  if (!hasRouter) return null //Prevent rendering without router initialised

  return (
    <SocketContext.Provider value={{ socket: socket }}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook to use the Socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
