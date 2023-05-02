import styles from 'styles/Home.module.css'
import { io, Socket } from "socket.io-client"
import { useEffect, useState } from 'react'
import { getUuid, handleNewUuid } from 'src/utils/helper'
import { PlayerColor } from 'src/game/resources/playerColors'
import { useRouter } from 'next/router'
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { Game } from 'api/socket'
import PageFrame from 'src/components/PageFrame'
import { LobbyCard, LobbyComp } from 'src/components/lobby/Lobby'
import Image from 'next/image'
import title_image from 'public/title_image.png'
import lobbyBackground_image from 'public/lobbyBackground.png'
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
  isBot?: boolean
}

export interface Lobby {
  id: string
  gameType: GameType,
  cooldown: number,
  players: Player[]
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Home() {
  const router = useRouter()
  const { lid } = router.query

  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    socketInitializer()
  }, [])

  useEffect(() => {
    if (!lid) {
      socket && leaveLobby()
      return
    }

    const lobby = lobbies.find(l => l.id == lid)

    if (!lobby) {
      router.push('/lobby')
    } else {
      joinLobby(lobby.id)
    }
  }, [lid])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected', socket.id)
      socket.emit('requestUuid', undefined, getUuid(), (newUuid, gameValidityData) => {
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

    socket.on('startGame', (lobbyId, uuids) => {
      if (uuids.includes(getUuid())) {
        router.push(`/play?lid=${lobbyId}`)
      }
    })
  }

  const createLobby = () => {
    socket.emit('createLobby', getUuid(), lid => {
      router.push(`/lobby?lid=${lid}`)
    })
  }

  const updateLobbySettings = (lobbyId: string, gameType: GameType, cooldown: number) => {
    socket.emit('changeLobbySettings', getUuid(), lobbyId, gameType, cooldown)
  }

  const joinLobby = (lobbyId: string, color: PlayerColor | undefined = undefined) => {
    if (!isPlayerInALobby() && lobbies.filter(l => l.id == lobbyId)[0]?.players?.length < 4) {
      socket.emit('joinLobby', lobbyId, color, getUuid())
    }
  }

  const addBot = (lobbyId: string, color: PlayerColor) => {
    if (lobbies.filter(l => l.id == lobbyId)[0]?.players.filter(p => p.uuid == getUuid())[0]) {
      socket.emit('addBotToLobby', lobbyId, color, getUuid())
    }
  }

  const removeBot = (lobbyId: string, color: PlayerColor) => {
    if (lobbies.filter(l => l.id == lobbyId)[0]?.players.filter(p => p.uuid == getUuid())[0]) {
      socket.emit('removeBotFromLobby', lobbyId, color, getUuid())
    }
  }

  const leaveLobby = (lobbyId: string = '') => {
    socket.emit('leaveLobby', lobbyId, getUuid())
    router.push('/lobby')
  }

  const handleUsernameChange = (lobbyId: string, newUsername: string) => {
    socket.emit('updateUsername', newUsername, getUuid(), lobbyId)
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

  const startMultiplayerGame = (lobbyId: string) => {
    socket.emit('startGame', lobbyId, getUuid())
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
            <div className={styles.titleImage} onClick={() => router.push('/')}>
              <Image src={title_image} alt='Title' fill style={{ objectFit: "contain" }}/>
            </div>
          </div>
          <div className={styles.container_l2}>
            {!lid && <button
              className={`button primaryAlert large marginBottom`}
              onClick={startSingleplayerGame} 
            >
              Quick Game
            </button>}

            {!lid && lobbies.length > 0 && <h2 className={`text_h2 ${styles.outline}`}>LOBBIES</h2>}

            {lobbies.length == 0 && <div className={styles.containerEmptyState}>
              <button 
                className={`button secondary large marginBottom`}
                onClick={createLobby}
              >
                Create Lobby
              </button>
            </div>}  
                     

            <div className={styles.container_l3}>
              <div className={styles.container_l4}>
                {lobbies.filter(l => l.id == lid).map(l => <LobbyComp 
                  key={l.id}
                  lobby={l}
                  handleChangePlayerColor={handleChangePlayerColor}
                  handleUsernameChange={handleUsernameChange}
                  joinLobby={joinLobby}
                  addBot={addBot}
                  removeBot={removeBot}
                  leaveLobby={leaveLobby}
                  startMultiplayerGame={startMultiplayerGame}
                  isPlayerInALobby={isPlayerInALobby}
                  updateLobbySettings={updateLobbySettings}
                />)}
                {!lid && lobbies.map(l => <LobbyCard lobby={l} handleClick={() => router.push(`/lobby?lid=${l.id}`)} />)}
              </div>
              {(!lid && !isPlayerInALobby() && lobbies.length > 0) && <div className={styles.bottomContainer}><button 
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
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
