import { GameState, GameType, Piece } from "src/game/resources/gameTypes"
import { Action } from "src/game/resources/gameValidation"
import { PlayerColor } from "src/game/resources/playerColors"
import { Lobby, Player, PublicPlayer } from "src/pages"
import { Game, GameValidityData } from "src/pages/api/socket"

export interface ServerToClientEvents {
  receiveUuid: (uuid: string) => void
  updateLobbies: (lobbies: Lobby[], games?: Game[]) => void
  startGame: (lobbyId: string, uuids: string[]) => void
  getGameValidityAndColors: (lobbyValid: boolean, playerColor: PlayerColor, activePlayerColor: PlayerColor, isInPlay: boolean, allPlayers: Player[], gameType?: GameType) => void
  receiveGameUpdate: (game: Game) => void
  playerUpdate: (lobbyId: string, players: Player[]) => void
}

export interface ClientToServerEvents {
  requestUuid: (lid: string | undefined, uuid: string | undefined, callback: (uuid: string, gameValidityData: GameValidityData) => void) => void
  createLobby: (uuid: string) => void
  changeLobbySettings: (uuid: string, lobbyId: string, gameType: GameType, cooldown: number) => void
  joinLobby: (lobbyId: string, color: PlayerColor, uuid: string) => void
  leaveLobby: (lobbyId: string, uuid: string) => void
  startGame: (lobbyId: string, uuid: string) => void
  updateUsername: (userName: string, uuid: string, lobbyId?: string) => void
  changePlayerColor: (lobbyId: string, color: PlayerColor | undefined, uuid: string) => void
  getGameValidityAndColors: (lobbyId: string, uuid: string) => void
  updateServerWithGameState: (
    lobbyId: string, 
    uuid: string, 
    action: Action,
    callback: (isValid: boolean, reason: string) => void
  ) => void
  playerUpdate: (players: Player[]) => void
}