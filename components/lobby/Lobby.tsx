import { Button, Paper } from "@mui/material"
import { useState } from "react"
import { PlayerColor } from "src/game/resources/playerColors"
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

const ColorSwitcher = ({ color, handleChangePlayerColor }: {color: PlayerColor, handleChangePlayerColor?: () => void}) => {
  return <div onClick={handleChangePlayerColor} className={`${styles.color} ${styles[color]}`}></div>
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
  const [editUsername, setEditUsername] = useState(false)

  return (
    <>
      <Paper>
        <div className={styles.container}>
          {lobby.players.map(p => {
            if (p.uuid == getUuid()) {
              return <div key={p.uuid} className={styles.playerContainer}>
                <ColorSwitcher color={p.color} handleChangePlayerColor={() => handleChangePlayerColor(lobby.id)}/>
                {!editUsername && <span onClick={() => setEditUsername(!editUsername)} className={`${styles.userName} ${styles.highlightPlayerName}`}>{p.username}</span>}
                {editUsername && <>
                  <input
                    id="usernameInput"
                    placeholder={p.username}
                  />
                  <button onClick={() => {
                    handleUsernameChange(lobby.id)
                    setEditUsername(false)
                  }}>Submit</button>
                </>}
              </div>
            } else {
              return <div key={p.uuid} className={styles.playerContainer}>
                <ColorSwitcher color={p.color} /><span className={styles.userName}>{p.username}</span>
              </div>
            }
          })}
          {!isPlayerInALobby() && <Button 
            onClick={() => joinLobby(lobby.id)}
            disabled={lobby.players.length > 3}
          >Join Lobby</Button>}
          {isPlayerInALobby(lobby.id) && <Button
            onClick={() => leaveLobby(lobby.id)}
          >Leave Lobby</Button>}
          {(lobby.players.length >= 2 && isPlayerInALobby(lobby.id)) && <Button
            onClick={() => startMultiplayerGame(lobby.id)}
          >Start Game</Button>}
        </div>
      </Paper>
    </>
  )
}
