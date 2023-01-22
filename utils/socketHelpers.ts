import { GameState, GameType, Piece } from "src/game/resources/gameTypes"
import { PlayerColor } from "src/game/resources/playerColors"
import { Lobby, Player, PublicPlayer } from "src/pages"
import { Game, GameValidityData } from "src/pages/api/socket"

export interface ServerToClientEvents {
  receiveUuid: (uuid: string) => void
  updateLobbies: (lobbies: Lobby[], games?: Game[]) => void
  triggerGameStart: (lobbyId: string, players: string[]) => void
  getGameValidityAndColors: (lobbyValid: boolean, playerColor: PlayerColor, activePlayerColor: PlayerColor, isInPlay: boolean, allPlayers: PublicPlayer[], gameType?: GameType) => void
  receiveGameUpdate: (game: Game, players: PublicPlayer[]) => void
  playerUpdate: (lobbyId: string, players: PublicPlayer[]) => void
}

export interface ClientToServerEvents {
  requestUuid: (lid: string | undefined, uuid: string | undefined, callback: (uuid: string, gameValidityData: GameValidityData) => void) => void
  createLobby: (uuid: string) => void
  changeLobbySettings: (uuid: string, lobbyId: string, gameType: GameType, cooldown: number) => void
  joinLobby: (lobbyId: string, color: PlayerColor, uuid: string) => void
  leaveLobby: (lobbyId: string, uuid: string) => void
  startGame: (lobbyId: string, uuid: string, gameType: GameType, cooldown: number) => void
  updateUsername: (userName: string, uuid: string, lobbyId?: string) => void
  changePlayerColor: (lobbyId: string, color: PlayerColor | undefined, uuid: string) => void
  getGameValidityAndColors: (lobbyId: string, uuid: string) => void
  updateServerWithGameState: (
    lobbyId: string, 
    uuid: string, 
    newGameState: GameState,
    newActivePlayerColor: PlayerColor | undefined, 
    newDiceValue: number | undefined, 
    newBlocks: number[], 
    newPieces: Piece[] | undefined, 
    newPlayers: PublicPlayer[] | undefined
  ) => void
  playerUpdate: (players: PublicPlayer[]) => void
}