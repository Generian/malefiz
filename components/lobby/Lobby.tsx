import { Lobby } from "src/pages"
import { getUuid } from "src/utils/helper"
import styles from 'styles/Lobby.module.css'

interface LobbyCompProps {
  lobby: Lobby
  handleChangePlayerColor: (lobbyId: string) => void
  handleUsernameChange: (lobbyId: string) => void
  joinLobby: (lobbyId: string) => void
  leaveLobby: (lobbyId: string) => void
  startMultiplayerGame: (lobbyId: string) => void
  isPlayerInALobby: (lobbyId?: string) => boolean
}

export const LobbyComp = ({ 
  lobby, 
  handleChangePlayerColor, 
  handleUsernameChange, 
  joinLobby, 
  leaveLobby, 
  startMultiplayerGame, 
  isPlayerInALobby 
}: LobbyCompProps) => {
  return (
    <>
      <div className={styles.container}>
        <p>{lobby.id}</p>
        <p>Players:</p>
        {lobby.players.map(p => {
          if (p.uuid == getUuid()) {
            return <div key={p.uuid}>
              <span onClick={() => handleChangePlayerColor(lobby.id)}>{p.color}</span>
              <input
                id="usernameInput"
                placeholder={p.username}
              />
              <button onClick={() => handleUsernameChange(lobby.id)}>Submit</button>
            </div>
          } else {
            return <div key={p.uuid}>
              <span>{p.color}</span><span>{p.username}</span>
            </div>
          }
        })}
        {!isPlayerInALobby() && <button 
          onClick={() => joinLobby(lobby.id)}
          disabled={lobby.players.length > 3}
        >Join Lobby</button>}
        {isPlayerInALobby(lobby.id) && <button
          onClick={() => leaveLobby(lobby.id)}
        >Leave Lobby</button>}
        {(lobby.players.length >= 2 && isPlayerInALobby(lobby.id)) && <button
          onClick={() => startMultiplayerGame(lobby.id)}
        >Start Game</button>}
      </div>
    </>
  )
}
