import { GameStates, Piece } from "src/game/resources/gameTypes"
import { PlayerColor } from "src/game/resources/playerColors"
import { Lobby } from "src/pages"
import { Game } from "src/pages/api/socket"

export interface ServerToClientEvents {
  receiveUuid: (uuid: string) => void
  updateLobbies: (lobbies: Lobby[], games?: Game[]) => void
  triggerGameStart: (lobbyId: string, players: string[]) => void
  getGameValidityAndColors: (lobbyValid: boolean, playerColor: PlayerColor, activePlayerColor: PlayerColor, allPlayerColors: PlayerColor[], isInPlay: boolean) => void
  receiveGameUpdate: (lobbyId: string, state: GameStates, activePlayer: PlayerColor, dice: number | undefined, blockers: number[], playerPieces: Piece[]) => void
}

export interface ClientToServerEvents {
  requestUuid: (uuid?: string) => void
  createLobby: (uuid: string) => void
  joinLobby: (lobbyId: string, uuid: string) => void
  leaveLobby: (lobbyId: string, uuid: string) => void
  startGame: (lobbyId: string, uuid: string) => void
  updateUsername: (userName: string, uuid: string, lobbyId?: string) => void
  changePlayerColor: (lobbyId: string, uuid: string) => void
  getGameValidityAndColors: (lobbyId: string, uuid: string) => void
  updateServerWithGameState: (lobbyId: string, uuid: string, state: GameStates, activePlayer: PlayerColor | undefined, dice: number | undefined, blockers: number[], playerPieces: Piece[] | undefined) => void
}