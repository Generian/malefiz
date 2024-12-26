// context/SocketContext.tsx
import router from "next/router"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react"
import { io, Socket } from "socket.io-client"
import { getUuid, handleNewUuid } from "src/utils/helper"
import { useData } from "./DataContext"
import { GameValidityData } from "src/pages/api/socket"

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
  const { lid } = router.query
  const { setGames, setGame, setPlayerColor } = useData()

  const socket = useRef<Socket | null>(null)

  const socketInitializer = async () => {
    console.log("Initialising socket")
    await fetch("/api/socket")
    socket.current = io()

    socket.current.on("connect", () => {
      console.log("connected", socket.current?.id)

      socket.current?.emit(
        "requestUuid",
        lid,
        getUuid(),
        (newUuid: string, { game, playerColor }: GameValidityData) => {
          handleNewUuid(newUuid)
          game && setGame(game)
          typeof lid === "string" &&
            playerColor &&
            setPlayerColor(lid, playerColor)
        }
      )
    })

    socket.current?.on("receiveGameUpdate", (game) => {
      game && setGame(game)
    })

    socket.current?.on("playerUpdate", (lobbyId, players) => {
      setGame({ lobbyId, players })
    })
  }

  useEffect(() => {
    // Initialize the socket connection
    socketInitializer()

    return () => {
      // Disconnect socket on cleanup
      socket.current?.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket: socket.current }}>
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
