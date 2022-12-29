import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { io, Socket } from "socket.io-client"
import { useEffect, useState } from 'react'
import { getCookie, getUuid } from 'src/utils/helper'
import { activeColors, PlayerColor } from 'src/game/resources/playerColors'
import { useRouter } from 'next/router';
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { Game } from './api/socket'
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import PageFrame from 'src/components/PageFrame'
import { LobbyComp } from 'src/components/lobby/Lobby'

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
  const [games, setGames] = useState<Game[]>([])

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

    socket.on('updateLobbies', (lobbies, games) => {
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

  const joinLobby = (lobbyId: string) => {
    socket.emit('joinLobby', lobbyId, getUuid())
  }

  const leaveLobby = (lobbyId: string) => {
    socket.emit('leaveLobby', lobbyId, getUuid())
  }

  const handleUsernameChange = (lobbyId?: string) => {
    const input = document.getElementById('usernameInput') as HTMLInputElement
    socket.emit('updateUsername', input.value, getUuid(), lobbyId)
  }

  const handleChangePlayerColor = (lobbyId: string) => {
    socket.emit('changePlayerColor', lobbyId, getUuid())
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
    const params = ['r', 'g', 'y', 'b']
    const colors = activeColors().map(c => {
      const checkbox = document.getElementById(c) as HTMLInputElement
      return checkbox?.checked
    })

    if (!colors.find(c => c) || !colors.filter(c => c == false).length) {
      router.push('/play')
      return
    }
    router.push(`/play?${colors.map((c, i) => c ? `${params[i]}=1&` : '').join('')}`)
  }

  const startMultiplayerGame = (lobbyId: string) => {
    socket.emit('startGame', lobbyId, getUuid())
  }
  
  return (
    <PageFrame>
      <div className={styles.container}>
        <div>
          {activeColors().map(c => <div key={c}>
            <input type="checkbox" id={c} name={c} defaultChecked/>
            <label htmlFor={c}>{c}</label>
          </div>)}
          <button onClick={startSingleplayerGame}>Start Game</button>
        </div>
        <span>Lobbies</span>
        {lobbies.map(l => <LobbyComp 
          key={l.id}
          lobby={l}
          handleChangePlayerColor={handleChangePlayerColor}
          handleUsernameChange={handleUsernameChange}
          joinLobby={joinLobby}
          leaveLobby={leaveLobby}
          startMultiplayerGame={startMultiplayerGame}
          isPlayerInALobby={isPlayerInALobby}
        />)}
        {!isPlayerInALobby() && <button onClick={createLobby}>Create Lobby</button>}
        <span>Games</span>
        {games?.map((g, i) => <div key={g.lobbyId}>
          <span onClick={() => router.push(`/play?lid=${g.lobbyId}`)}>Game {i + 1}</span>
        </div>)}
      </div>
    </PageFrame>
  )
}
