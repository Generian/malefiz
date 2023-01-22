import { IconButton, Paper } from "@mui/material"
import { useEffect, useState } from "react"
import { activeColors, PlayerColor } from "src/game/resources/playerColors"
import { Lobby, Player } from "src/pages"
import { getUuid } from "src/utils/helper"
import styles from 'styles/Lobby.module.css'
import React, { KeyboardEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { GameType } from "src/game/resources/gameTypes"

interface LobbyCompProps {
  lobby: Lobby
  handleChangePlayerColor: (lobbyId: string, color?: PlayerColor) => void
  handleUsernameChange: (lobbyId: string) => void
  joinLobby: (lobbyId: string, color: PlayerColor) => void
  leaveLobby: (lobbyId: string) => void
  startMultiplayerGame: (lobbyId: string, gameType: GameType, cooldown: number) => void
  isPlayerInALobby: (lobbyId?: string) => boolean
  updateLobbySettings: (lobbyId: string, gameType: GameType, cooldown: number) => void
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
  isPlayerInALobby,
  updateLobbySettings
}: LobbyCompProps) => {
  const countdowns = [0, 5, 10]

  const [gameType, setGameType] = useState<GameType>(lobby.gameType)
  const [cooldown, setCooldown] = useState(lobby.cooldown)
  const [editUsername, setEditUsername] = useState(false)

  useEffect(() => {
    setGameType(lobby.gameType)
    setCooldown(lobby.cooldown)
  }, [lobby.gameType, lobby.cooldown])

  const updateSettingsWithServer = (gameType: GameType, cooldown: number) => {
    if (isPlayerInALobby(lobby.id)) {
      setGameType(gameType)
      setCooldown(cooldown)
      updateLobbySettings(lobby.id, gameType, cooldown)
    }
  }

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
          <div className={styles.otherPlayer}>
            <span className={styles.userName}>{p.username}</span>
            <div className={`${styles.onlineStatus} ${p.online ? styles.online : ''}`}></div>
          </div>
        </div>
      </div>
    }
  }

  return (
    <Paper className={styles.container} elevation={3}>
      <span className={styles.subTitle}>Lobby</span>
      <span className={styles.lobbyId}>{lobby.id}</span>
      <div className={styles.settings} style={{ pointerEvents: isPlayerInALobby(lobby.id) ? 'all' : 'none' }}>
        <div className={`${styles.settingsModeContainer}`}>
          <span className={`text_span_small ${styles.subTitle}`}>Game Mode</span>
          <div className={styles.buttonContainer}>
            <button onClick={() => updateSettingsWithServer('NORMAL', cooldown)} className={`button small ${gameType == 'NORMAL' ? 'primary' : 'secondary'}`}>Normal</button>
            <button onClick={() => updateSettingsWithServer('COMPETITION', cooldown)} className={`button small ${gameType == 'COMPETITION' ? 'primary' : 'secondary'}`}>Competition</button>
          </div>
        </div>
        <div className={`${styles.settingsModeContainer} ${styles.settingsCooldownContainer} ${gameType == 'NORMAL' ? styles.hidden : ''}`}>
          <span className={`text_span_small ${styles.subTitle}`}>Cooldown</span>
          <div className={styles.buttonContainer}>
            {countdowns.map(c => <button key={c} onClick={() => updateSettingsWithServer(gameType, c)} className={`button small ${cooldown == c ? 'primary' : 'secondary'}`}>{c}</button>)}
          </div>
        </div>
      </div>
      {activeColors().map(c => {
        const player = lobby.players.filter(p => p.color == c.color)[0]
        if (player) {
          return <PlayerPlaceholder key={player.username} p={player}/>
        } else {
          return <EmptyPlayerPlaceholder key={c.color} color={c.color} onClick={isPlayerInALobby(lobby.id) ? () => handleChangePlayerColor(lobby.id, c.color) : () => joinLobby(lobby.id, c.color)}/>
        }
      })}
      {<button
        onClick={() => startMultiplayerGame(lobby.id, gameType, cooldown)}
        className={`button primary`}
        disabled={!(lobby.players.length >= 2 && isPlayerInALobby(lobby.id))}
      >
        Start Game
      </button>}
    </Paper>
  )
}
