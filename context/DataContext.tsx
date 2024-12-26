// context/SocketContext.tsx
import React, { createContext, useContext, ReactNode, useState } from "react"
import { PlayerColor } from "src/game/resources/playerColors"
import { Game } from "src/pages/api/socket"

// Define the shape of the context
interface DataContextType {
  games: {
    [key: string]: Game
  }
  getGame: (lid: string) => Game
  setGames: React.Dispatch<
    React.SetStateAction<{
      [key: string]: Game
    }>
  >
  setGame: (newGameData: Partial<Game>) => void
  getPlayerColor: (lid: string) => PlayerColor
  setPlayerColor: (lid: string, playerColor: PlayerColor) => void
}

// Create the context with an initial value of null
const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [games, setGames] = useState<{
    [key: string]: Game
  }>({})
  const [playerColorsPerGame, setPlayerColorsPerGame] = useState<{
    [key: string]: PlayerColor
  }>({})

  const getGame = (lid: string) => {
    return games[lid]
  }

  const setGame = (newGameData: Partial<Game>) => {
    if (!newGameData.lobbyId) {
      throw new Error(
        "Error setting new game data in data context. No game with valid lobbyId provided."
      )
      return
    }
    setGames((oldGames) => {
      const newGames = { ...oldGames }
      newGames[newGameData.lobbyId as string] = {
        ...oldGames[newGameData.lobbyId as string],
        ...newGameData,
      }
      return newGames
    })
  }

  const getPlayerColor = (lid: string) => {
    return playerColorsPerGame[lid]
  }

  const setPlayerColor = (lid: string, playerColor: PlayerColor) => {
    if (!lid || !playerColor) {
      throw new Error("Error setting new player color in data context.")
      return
    }
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
        getGame,
        setGames,
        setGame,
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
