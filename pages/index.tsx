import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { io, Socket } from "socket.io-client"
import { useEffect, useState } from 'react'
import { getCookie, getUuid } from 'src/utils/helper'
import { PlayerColor } from 'src/game/resources/playerColors'
import { useRouter } from 'next/router';
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'

export interface Player {
  uuid: string
  username: string
  color: PlayerColor
}

export interface Lobby {
  id: string
  players: Player[]
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Home() {
  const [lobbies, setLobbies] = useState<Lobby[]>([])

  const router = useRouter()

  useEffect(() => {socketInitializer()}, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected', socket.id)
      socket.emit('requestUuid', getUuid())
    })

    socket.on('receiveUuid', newUuid => {
      const uuid = getUuid()

      // Handle new UUID
      if (newUuid == uuid) {
        console.log("Expected case. No cookie update needed. Uuid:", uuid)
      } else if (!uuid) {
        console.log("No uuid set yet. Saving new uuid in cookie:", newUuid)
        document.cookie = `uuid=${newUuid}; expires=${new Date(new Date().getTime()+60*60*1000*24).toUTCString()}`
      } else {
        console.error("Received a mismatching uuid. Unexpected error.")
      }
    })

    socket.on('updateLobbies', lobbies => {
      setLobbies(lobbies)
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

  const joinLobby = (lobbyId: string) => {
    socket.emit('joinLobby', lobbyId, getUuid())
  }

  const leaveLobby = (lobbyId: string) => {
    socket.emit('leaveLobby', lobbyId, getUuid())
  }

  const handleUsernameChange = () => {
    console.log("new message")
    const input = document.getElementById('usernameInput') as HTMLInputElement
    socket.emit('updateUsername', input.value)
  }

  const isPlayerInALobby = (lobbyId?: string) => {
    let filteredLobbies = lobbies
    if (lobbyId) {
      filteredLobbies = filteredLobbies.filter(l => l.id == lobbyId)
    }
    const allPlayers = filteredLobbies.map(l => l.players).map(p => p.map(p => p.uuid)).flat()
    return allPlayers.includes(getUuid())
  }

  const startGame = (lobbyId: string) => {
    socket.emit('startGame', lobbyId, getUuid())
  }
  
  return (
    <>
      <Head>
        <title>Play Malefiz online</title>
        <meta name="description" content="Play Malefiz online" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <span>Lobbies</span>
          {lobbies.map(l => <div key={l.id} style={{ border: "1px solid black"}}>
            <p>{l.id}</p>
            <p>Players:</p>
            {l.players.map(p => {
              if (p.uuid == getCookie('uuid')) {
                return <div key={p.uuid}>
                  <span>{p.color}</span>
                  <input
                    id="usernameInput"
                    placeholder={p.username}
                  />
                  <button onClick={handleUsernameChange}>Submit</button>
                </div>
              } else {
                return <div key={p.uuid}>
                  <span>{p.color}</span><span>{p.username}</span>
                </div>
              }
            })}
            {!isPlayerInALobby(l.id) && <button 
              onClick={() => joinLobby(l.id)}
              disabled={l.players.length > 3}
            >Join Lobby</button>}
            {isPlayerInALobby(l.id) && <button
              onClick={() => leaveLobby(l.id)}
            >Leave Lobby</button>}
            {(l.players.length >= 2 && isPlayerInALobby(l.id)) && <button
              onClick={() => startGame(l.id)}
            >Start Game</button>}
          </div>)}
          {!isPlayerInALobby() && <button onClick={createLobby}>Create Lobby</button>}
        </div>
      </main>
    </>
  )
}
