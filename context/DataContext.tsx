// context/SocketContext.tsx
import React, { createContext, useContext, ReactNode, useState } from "react"
import { PlayerColor } from "src/game/resources/playerColors"
import { Lobby } from "src/pages"
import { Game } from "src/pages/api/socket"

// Define the shape of the context
interface DataContextType {
  games: Game[]
  lobbies: Lobby[]
  getGame: (lid: string) => Game | undefined
  setGame: (newGameData: Partial<Game> | undefined) => void
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
  getLobby: (lid: string) => Lobby | undefined
  setLobby: (newLobbyData: Partial<Lobby>) => void
  setLobbies: React.Dispatch<React.SetStateAction<Lobby[]>>
  playerColorsPerGame: {
    [key: string]: PlayerColor
  }
  getPlayerColor: (lid: string) => PlayerColor
  setPlayerColor: (
    lid: string | string[] | undefined,
    playerColor: PlayerColor | undefined
  ) => void
}

// Create the context with an initial value of null
const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [playerColorsPerGame, setPlayerColorsPerGame] = useState<{
    [key: string]: PlayerColor
  }>({})

  const getGame = (lid: string) => {
    return games.find((g) => g.lobbyId === lid)
  }

  const setGame = (newGameData: Partial<Game> | undefined) => {
    if (!newGameData) {
      console.log("Can't set game data in data context. No game provided.")
      return
    }
    if (!newGameData.lobbyId) {
      throw new Error(
        "Error setting new game data in data context. No game with valid lobbyId provided."
      )
      return
    }
    setGames((oldGames) => {
      const newGames = [...oldGames]
      const index = oldGames.indexOf(
        oldGames.filter((g) => g.lobbyId == (newGameData.lobbyId as string))[0]
      )
      newGames.splice(index, 1, {
        ...oldGames[index],
        ...newGameData,
      })
      return newGames
    })
  }

  const getLobby = (lid: string) => {
    return lobbies.find((l) => l.id === lid)
  }

  const setLobby = (newLobbyData: Partial<Lobby>) => {
    if (!newLobbyData.id) {
      throw new Error(
        "Error setting new lobby data in data context. No lobby with valid lobbyId provided."
      )
      return
    }
    setLobbies((oldLobbies) => {
      const newLobbies = [...oldLobbies]
      const index = oldLobbies.indexOf(
        oldLobbies.filter((l) => l.id == (newLobbyData.id as string))[0]
      )
      newLobbies.splice(index, 1, {
        ...oldLobbies[index],
        ...newLobbyData,
      })
      return newLobbies
    })
  }

  const getPlayerColor = (lid: string) => {
    console.log("Getting player color from:", playerColorsPerGame, lid)
    return playerColorsPerGame[lid]
  }

  const setPlayerColor = (
    lid: string | string[] | undefined,
    playerColor: PlayerColor | undefined
  ) => {
    if (!lid || !playerColor || typeof lid !== "string") {
      console.log(
        "Can't set player color without valid lid and playerColor. Lid: " +
          lid +
          " Playercolor: " +
          playerColor
      )
      return
    }
    console.log("Setting player color:", lid)

    setPlayerColorsPerGame((oldPlayerColors) => {
      const newPlayerColors = { ...oldPlayerColors }
      newPlayerColors[lid] = playerColor
      return newPlayerColors
    })
  }

  return (
    <DataContext.Provider
      value={{
        games,
        lobbies,
        getGame,
        setGames,
        setGame,
        getLobby,
        setLobby,
        setLobbies,
        playerColorsPerGame,
        getPlayerColor,
        setPlayerColor,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Hook to use the Socket context
export const useData = (): DataContextType => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataContextProvider")
  }
  return context
}

// Helpers
const updateElementInArray = (array: any[], newElement: any): any[] => {
  const newArray = [...array]
  const index = array.indexOf(array.filter((e) => e.id == newElement.id)[0])
  newArray.splice(index, 1, newElement)
  return newArray
}
