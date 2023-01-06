import { IconButton, Paper } from "@mui/material"
import { useState } from "react"
import { activeColors, PlayerColor } from "src/game/resources/playerColors"
import { Lobby, Player } from "src/pages"
import { getUuid } from "src/utils/helper"
import styles from 'styles/Lobby.module.css'
import React, { KeyboardEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'

interface LobbyCompProps {
  lobby: Lobby
  handleChangePlayerColor: (lobbyId: string, color?: PlayerColor) => void
  handleUsernameChange: (lobbyId: string) => void
  joinLobby: (lobbyId: string, color: PlayerColor) => void
  leaveLobby: (lobbyId: string) => void
  startMultiplayerGame: (lobbyId: string) => void
  isPlayerInALobby: (lobbyId?: string) => boolean
}

const ColorIndicator = ({ color, active }: {color: PlayerColor, active: boolean}) => {
  return <div 
    className={`${styles.color} ${styles[color]} ${active ? styles.active : styles.inactive}`}
  >
  </div>
}

const EmptyPlayerPlaceholder = ({ color, onClick }: {color: PlayerColor, onClick: () => void}) => {
  return <div className={`${styles.player} ${styles.clickable}`} onClick={onClick}>
    <ColorIndicator color={color} active={false} />
    <span className={styles.placeholderText} title='Click to switch to this slot.'>No player yet.</span>
  </div>
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

  const handleInputConfirm = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleUsernameChange(lobby.id)
      setEditUsername(false)
    }
  }

  const PlayerPlaceholder = ({ p }: { p: Player } ) => {
    if (p.uuid == getUuid()) {
      return <div key={p.uuid} className={styles.player}>
        <ColorIndicator color={p.color} active={true} />
        <div className={styles.usernameContainer}>
          {!editUsername && <span 
            onClick={() => setEditUsername(!editUsername)} 
            className={`${styles.userName} ${styles.highlightPlayerName} ${styles.clickable}`}
          >
            {p.username}
          </span>}
          {editUsername && <>
            <input
              id="usernameInput"
              placeholder={p.username}
              className={styles.usernameInput}
              onKeyDown={handleInputConfirm}
            />
          </>}
          {isPlayerInALobby(lobby.id) && <IconButton 
            aria-label="exit"
            size="small"
            onClick={() => leaveLobby(lobby.id)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>}
        </div>
      </div>
    } else {
      return <div key={p.uuid} className={styles.player}>
        <ColorIndicator color={p.color} active={true} />
        <div className={styles.usernameContainer}>
          <span className={styles.userName}>{p.username}</span>
        </div>
      </div>
    }
  }

  return (
    <Paper className={styles.container} elevation={3}>
      <span className={styles.lobbyTitle}>Lobby</span>
      <span className={styles.lobbyId}>{lobby.id}</span>
      {activeColors().map(c => {
        const player = lobby.players.filter(p => p.color == c.color)[0]
        if (player) {
          return <PlayerPlaceholder key={player.username} p={player}/>
        } else {
          return <EmptyPlayerPlaceholder key={c.color} color={c.color} onClick={isPlayerInALobby(lobby.id) ? () => handleChangePlayerColor(lobby.id, c.color) : () => joinLobby(lobby.id, c.color)}/>
        }
      })}
      {<button
        onClick={() => startMultiplayerGame(lobby.id)}
        className={`button primary`}
        disabled={!(lobby.players.length >= 2 && isPlayerInALobby(lobby.id))}
      >
        Start Game
      </button>}
    </Paper>
  )
}
