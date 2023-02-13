import { IconButton, Paper } from "@mui/material"
import { useEffect, useState } from "react"
import { activeColors, PlayerColor } from "src/game/resources/playerColors"
import { Lobby, Player } from "src/pages"
import { getUuid } from "src/utils/helper"
import styles from 'styles/Lobby.module.css'
import React, { KeyboardEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { GameType } from "src/game/resources/gameTypes"

interface LobbyCompProps {
  lobby: Lobby
  handleChangePlayerColor: (lobbyId: string, color?: PlayerColor) => void
  handleUsernameChange: (lobbyId: string, newUsername: string) => void
  joinLobby: (lobbyId: string, color: PlayerColor) => void
  leaveLobby: (lobbyId: string) => void
  startMultiplayerGame: (lobbyId: string, gameType: GameType, cooldown: number) => void
  isPlayerInALobby: (lobbyId?: string) => boolean
  updateLobbySettings: (lobbyId: string, gameType: GameType, cooldown: number) => void
}

interface PlayerPlaceholderProps {
  p: Player, 
  lobby: Lobby,
  handleInputConfirm: (e: string) => void, 
  isPlayerInALobby: (lobbyId: string) => boolean, 
  leaveLobby: (lobbyId: string) => void
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

const PlayerPlaceholder = ({ 
  p,
  lobby,
  handleInputConfirm, 
  isPlayerInALobby, 
  leaveLobby 
}: PlayerPlaceholderProps ) => {
  const [isEditing, setIsEditing] = useState(false)

  if (p.uuid == getUuid()) {
    return <div key={p.uuid} className={styles.player}>
      <ColorIndicator color={p.color} active={true} />
      <div className={styles.usernameContainer}>
        <input
          className={`${styles.usernameInput}`}
          defaultValue={p.username}
          onFocus={e => {
            setIsEditing(true)
            e.target.select()
          }}
          onBlur={e => {
            const newUsername = e.target.value
            if (!newUsername) {
              e.target.value = p.username
            } else {
              handleInputConfirm(newUsername)
            }
            setIsEditing(false)
          }}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key == 'Enter') {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
            }
          }}
        />
        <div className={styles.usernameButtonContainer}>
          {isPlayerInALobby(lobby.id) && !isEditing && <IconButton 
            aria-label="exit"
            size="small"
            onClick={() => leaveLobby(lobby.id)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>}
          {isEditing && <IconButton 
            aria-label="submit"
            size="small"
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
            }}
          >
            <CheckRoundedIcon fontSize="inherit" />
          </IconButton>}
        </div>
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
  // const [editUsername, setEditUsername] = useState(false)

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

  const handleInputConfirm = (newUsername: string) => {
    if (newUsername) {
      handleUsernameChange(lobby.id, newUsername)
      // setEditUsername(false)
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
          return <PlayerPlaceholder 
            key={`${lobby.id}_${c.color}`} 
            p={player}
            lobby={lobby}
            handleInputConfirm={handleInputConfirm}
            isPlayerInALobby={isPlayerInALobby}
            leaveLobby={leaveLobby}
          />
        } else {
          return <EmptyPlayerPlaceholder key={`${lobby.id}_${c.color}`} color={c.color} onClick={isPlayerInALobby(lobby.id) ? () => handleChangePlayerColor(lobby.id, c.color) : () => joinLobby(lobby.id, c.color)}/>
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
