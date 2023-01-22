import styles from '../styles/Home.module.css'
import { io, Socket } from "socket.io-client"
import { useEffect, useState } from 'react'
import { getUuid, handleNewUuid } from 'src/utils/helper'
import { PlayerColor } from 'src/game/resources/playerColors'
import { useRouter } from 'next/router';
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { Game } from './api/socket'
import PageFrame from 'src/components/PageFrame'
import { LobbyComp } from 'src/components/lobby/Lobby'
import Image from 'next/image'
import title_image from '../public/title_image.png'
import lobbyBackground_image from '../public/lobbyBackground.png'
import suggestions from '../public/suggestions.png'
import { GameState, GameType } from 'src/game/resources/gameTypes'

export interface Player extends PublicPlayer {
  uuid: string
}

export interface PublicPlayer {
  username: string
  color: PlayerColor
  nextMoveTime?: EpochTimeStamp
  gameState?: GameState
  diceValue?: number
  online?: boolean
}

export interface Lobby {
  id: string
  gameType: GameType,
  cooldown: number,
  players: Player[]
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Home() {
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const [games, setGames] = useState<Game[]>([])

  const router = useRouter()

  useEffect(() => {socketInitializer()}, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected', socket.id)
      socket.emit('requestUuid', undefined, getUuid(), (newUuid) => {
        handleNewUuid(newUuid)
      })
    })

    // socket.on('receiveUuid', newUuid => {
    //   const uuid = getUuid()

    //   // Handle new UUID
    //   if (newUuid == uuid) {
    //     console.log("Expected case. No cookie update needed. Uuid:", uuid)
    //   } else if (!uuid) {
    //     console.log("No uuid set yet. Saving new uuid in cookie:", newUuid)
    //     document.cookie = `uuid=${newUuid}; expires=${new Date(new Date().getTime()+60*60*1000*24).toUTCString()}`
    //   } else {
    //     console.error("Received a mismatching uuid. Unexpected error.")
    //   }
    // })

    socket.on('updateLobbies', (lobbies, games) => {
      console.log("Lobbies update:", lobbies)
      setLobbies(lobbies)
      games && setGames(games)
    })

    socket.on('triggerGameStart', (lobbyId, players) => {
      if (players.includes(getUuid())) {
        router.push(`/play?lid=${lobbyId}`)
      }
    })
  }

  const createLobby = () => {
    socket.emit('createLobby', getUuid())
  }

  const updateLobbySettings = (lobbyId: string, gameType: GameType, cooldown: number) => {
    socket.emit('changeLobbySettings', getUuid(), lobbyId, gameType, cooldown)
  }

  const joinLobby = (lobbyId: string, color: PlayerColor) => {
    if (!isPlayerInALobby() && lobbies.filter(l => l.id == lobbyId)[0]?.players?.length < 4) {
      socket.emit('joinLobby', lobbyId, color, getUuid())
    }
  }

  const leaveLobby = (lobbyId: string) => {
    socket.emit('leaveLobby', lobbyId, getUuid())
  }

  const handleUsernameChange = (lobbyId?: string) => {
    const input = document.getElementById('usernameInput') as HTMLInputElement
    socket.emit('updateUsername', input.value, getUuid(), lobbyId)
  }

  const handleChangePlayerColor = (lobbyId: string, color?: PlayerColor) => {
    socket.emit('changePlayerColor', lobbyId, color, getUuid())
  }

  const isPlayerInALobby = (lobbyId?: string) => {
    let filteredLobbies = lobbies
    if (lobbyId) {
      filteredLobbies = filteredLobbies.filter(l => l.id == lobbyId)
    }
    const allPlayers = filteredLobbies.map(l => l.players).map(p => p.map(p => p.uuid)).flat()
    return allPlayers.includes(getUuid())
  }

  const startSingleplayerGame = () => {
    lobbies.filter(l => l.players.map(p => p.uuid).includes(getUuid())).forEach(l => leaveLobby(l.id))
    router.push('/play')
  }

  const startMultiplayerGame = (lobbyId: string, gameType: GameType, cooldown: number) => {
    socket.emit('startGame', lobbyId, getUuid(), gameType, cooldown)
  }
  
  return (
    <PageFrame>
      <div className={`${styles.container} background`}>
        <div className={styles.backgroundImage}>
          <Image 
            src={lobbyBackground_image} 
            alt='malefiz background image' 
            layout='fill'
            objectFit='contain'
          />
        </div>
        <div className={styles.container_l1}>
          <div className={styles.titleImageContainer}>
            <div className={styles.titleImage}>
              <Image src={title_image} alt='Title' fill style={{ objectFit: "contain" }}/>
            </div>
          </div>
          <div className={styles.container_l2}>
            <button
              className={`button primaryAlert large marginBottom`}
              onClick={startSingleplayerGame} 
            >
              Quick Game
            </button>
            {!lobbies.length && <button 
              className={`button secondary large marginBottom`}
              onClick={createLobby}
            >
              Create Lobby
            </button>}
            {lobbies.length > 0 && <h2 className={`text_h2 ${styles.outline}`}>LOBBIES</h2>}
            <div className={styles.container_l3}>
              <div className={styles.container_l4}>
                {lobbies.map(l => <LobbyComp 
                  key={l.id}
                  lobby={l}
                  handleChangePlayerColor={handleChangePlayerColor}
                  handleUsernameChange={handleUsernameChange}
                  joinLobby={joinLobby}
                  leaveLobby={leaveLobby}
                  startMultiplayerGame={startMultiplayerGame}
                  isPlayerInALobby={isPlayerInALobby}
                  updateLobbySettings={updateLobbySettings}
                />)}
              </div>
              {(!isPlayerInALobby() && lobbies.length > 0) && <div className={styles.bottomContainer}><button 
                className={`button secondary marginBottom`}
                onClick={createLobby}
              >
                Create Lobby
              </button></div>}
            </div>
            {/* <Paper>
              <div className={styles.container_l3}>
                <Typography variant="h4">
                  Games
                </Typography>
                {games?.map((g, i) => <div key={g.lobbyId}>
                  <span onClick={() => router.push(`/play?lid=${g.lobbyId}`)}>Game {i + 1}</span>
                </div>)}
              </div>
            </Paper> */}
            <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', width: '3rem', height: '3rem' }}>
              <Image 
                src={suggestions} 
                alt='leave a suggestion' 
                layout='fill'
                objectFit='contain'
              />
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
