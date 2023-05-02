import { Card, CardActionArea, IconButton, Menu, MenuItem, Paper } from "@mui/material"
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
  addBot: (lobbyId: string, color: PlayerColor) => void
  removeBot: (lobbyId: string, color: PlayerColor) => void
  leaveLobby: (lobbyId: string) => void
  startMultiplayerGame: (lobbyId: string, gameType: GameType, cooldown: number) => void
  isPlayerInALobby: (lobbyId?: string) => boolean
  updateLobbySettings: (lobbyId: string, gameType: GameType, cooldown: number) => void
}

interface LobbyCardProps {
  lobby: Lobby
  handleClick: () => void
}

interface PlayerPlaceholderProps {
  p: Player
  lobby: Lobby
  handleInputConfirm: (e: string) => void
  isPlayerInALobby: (lobbyId: string) => boolean
  leaveLobby: (lobbyId: string) => void
  removeBot: (lobbyId: string, color: PlayerColor) => void
}

interface EmptyPlayerPlaceholderProps {
  lobby: Lobby
  color: PlayerColor
  enterPlace: () => void
  addBot: (lobbyId: string, color: PlayerColor) => void
  isPlayerInALobby: (lobbyId: string) => boolean
}

const ColorIndicator = ({ color, active }: {color: PlayerColor, active: boolean}) => {
  return <div 
    className={`${styles.color} ${styles[color]} ${active ? styles.active : styles.inactive}`}
  >
  </div>
}

const EmptyPlayerPlaceholder = ({ 
  lobby, 
  color, 
  enterPlace,
  addBot,
  isPlayerInALobby
}: EmptyPlayerPlaceholderProps) => {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number
    mouseY: number
  } | null>(null)

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    )
  }

  const handleClose = () => {
    setContextMenu(null)
  }

  return (
    <>
      <div 
        className={`${styles.player} ${styles.clickable}`} 
        onClick={e => {
          if (isPlayerInALobby(lobby.id)) {
            handleContextMenu(e)
          } else {
            enterPlace()
          }
        }}
      >
        <ColorIndicator color={color} active={false} />
        <span className={styles.placeholderText} title='Click to switch to this slot.'>No player yet.</span>
      </div>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          enterPlace()
          handleClose()
        }}>
          {`Play as ${color.toLowerCase()}`}
        </MenuItem>
        <MenuItem onClick={() => {
          addBot(lobby.id, color)
          handleClose()
        }}>
          Add bot
        </MenuItem>
      </Menu>
    </>
  )
}

const PlayerPlaceholder = ({ 
  p,
  lobby,
  handleInputConfirm, 
  isPlayerInALobby, 
  leaveLobby,
  removeBot
}: PlayerPlaceholderProps ) => {
  const [isEditing, setIsEditing] = useState(false)

  if (p.uuid == getUuid() || p.isBot) {
    return <div key={p.uuid} className={styles.player}>
      <ColorIndicator color={p.color} active={true} />
      <div className={styles.usernameContainer}>
        {!p.isBot && <input
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
        />}
        {p.isBot && <span className={styles.botName}>{p.username}</span>}
        <div className={styles.usernameButtonContainer}>
          {isPlayerInALobby(lobby.id) && !isEditing && <IconButton 
            aria-label="exit"
            size="small"
            onClick={() => {
              if (p.isBot) {
                removeBot(lobby.id, p.color)
              } else {
                leaveLobby(lobby.id)
              }
            }}
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
  addBot,
  removeBot,
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
    <Paper 
      className={styles.container} 
      elevation={3}
    >
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
            removeBot={removeBot}
          />
        } else {
          return <EmptyPlayerPlaceholder 
            key={`${lobby.id}_${c.color}`} 
            lobby={lobby}
            color={c.color} 
            enterPlace={isPlayerInALobby(lobby.id) ? () => handleChangePlayerColor(lobby.id, c.color) : () => joinLobby(lobby.id, c.color)}
            addBot={addBot}
            isPlayerInALobby={isPlayerInALobby}
          />
        }
      })}
      {<button
        onClick={() => startMultiplayerGame(lobby.id, gameType, cooldown)}
        className={`button primary`}
        disabled={!(lobby.players.length >= 2 && isPlayerInALobby(lobby.id))}
        title={!isPlayerInALobby(lobby.id) ? "You're not a member of this lobby." : lobby.players.length < 2 ? 'Not enough players. Add at least one more.' : ''}
      >
        Start Game
      </button>}
    </Paper>
  )
}

export const LobbyCard = ({
  lobby,
  handleClick
}: LobbyCardProps) => {
  return (
    <div className={styles.cardContainerParent} >

    <Card
      style={{width:'100%'}}
      onClick={handleClick}
    >
      <CardActionArea>
        <div className={styles.cardContainer}>
        <span className={styles.subTitle}>Lobby</span>
        <span className={styles.lobbyId}>{lobby.id}</span>
        <div className={styles.settings}>
          <div className={`${styles.settingsModeContainer} ${styles.hidden}`}>
            <span className={`text_span_small ${styles.subTitle}`}>Game Mode</span>
            <div className={styles.buttonContainer}>
              <button 
                className={`button small`}
              >
                {lobby.gameType == 'NORMAL' ? 'Normal' : 'Competition'}
              </button>
            </div>
          </div>
          <div className={`${styles.settingsModeContainer} ${styles.settingsCooldownContainer} ${lobby.gameType == 'NORMAL' ? styles.hidden : ''}`}>
            <span className={`text_span_small ${styles.subTitle}`}>Cooldown</span>
            <div className={styles.buttonContainer}>
              <button className={`button small`}>{lobby.cooldown}</button>
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
              handleInputConfirm={() => {}}
              isPlayerInALobby={() => false}
              leaveLobby={() => {}}
              removeBot={() => {}}
            />
          } else {
            return <EmptyPlayerPlaceholder 
              key={`${lobby.id}_${c.color}`} 
              lobby={lobby}
              color={c.color} 
              enterPlace={() => {}}
              addBot={() => {}}
              isPlayerInALobby={() => false}
            />
          }
        })}
        </div>
      </CardActionArea>
    </Card>
    </div>
  )
}
