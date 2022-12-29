import { Server } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import { v4 } from 'uuid'
import { Lobby, Player } from '..'
import { createLobbyId } from 'src/utils/helper'
import { nextPlayerColor, PlayerColor } from 'src/game/resources/playerColors'
import { GameStates, Piece } from 'src/game/resources/gameTypes'

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

interface User {
  sockets: string[],
  username?: string
}

interface Players {
  [key: string]: User
}

export interface Game {
  lobbyId: string
  players: Player[]
  activePlayerColor: PlayerColor
  turn: number
  data?: {
    state: GameStates, 
    activePlayer: PlayerColor, 
    dice: number | undefined, 
    blockers: number[], 
    playerPieces: Piece[]
  }
}

interface Games {
  [key: string]: Game
}

const SocketHandler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res?.socket?.server?.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    // Set variables
    const players: Players = {}
    let lobbies: Lobby[] = []
    const games: Games = {}

    const getLobbyById = (lobbyId: string) => lobbies.filter(l => l.id == lobbyId)[0]

    const updateLobbyInLobbies = (newLobby: Lobby) => {
      const otherLobbies = lobbies.filter(l => l.id != newLobby.id)
      lobbies = [...otherLobbies, newLobby]
      return
    }

    const getNewLobbyUsername = (uuid: string, lobbyId?: string) => {
      let newLobbyUsername = players[uuid]?.username
      if (!newLobbyUsername) {
        newLobbyUsername = "Player 1"
        let i = 1
        if (lobbyId) {
          const lobby = getLobbyById(lobbyId)
          while (lobby.players.map(p => p.username).includes(newLobbyUsername)) {
            i += 1
            newLobbyUsername = `Player ${i}`
          }
        }
      }
      return newLobbyUsername
    }

    const getFreeColors = (lobbyId?: string) => {
      let freeColors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE']
      if (lobbyId) {
        const lobby = getLobbyById(lobbyId)
        lobby.players.forEach(p => {
          freeColors = freeColors.filter(c => c != p.color)
        })
      }
      return freeColors
    }

    // Logic starts here
    io.on('connection', socket => {

      // Set user uuid
      socket.on('requestUuid', uuid => {
        let newUuid = uuid
        if (uuid) {
          const player = players[uuid]
          if (player) {
            if (player.sockets.includes(socket.id)) {
              console.log("User with given uuid and socket id already known.")
            } else {
              players[uuid] = {
                ...player,
                sockets: [...player.sockets, socket.id]
              }
            }
          } else {
            players[uuid] = {
              sockets: [socket.id]
            }
          }
        } else {
          newUuid = v4()
          players[newUuid] = {
            sockets: [socket.id]
          }
        }

        socket.emit('receiveUuid', newUuid)

        // Initialise user with data
        io.emit('updateLobbies', lobbies, Object.values(games))

        // Find lobby player might be in and send game data
        const game = Object.values(games).find(g => g.players.map(p => p.uuid).includes(newUuid))
        if (game && game.data) {
          socket.emit('receiveGameUpdate', game.lobbyId, game.data.state, game.data.activePlayer, game.data.dice, game.data.blockers, game.data.playerPieces)
        }
      })

      // Lobbies handling
      socket.on('createLobby', uuid => {
        if (!uuid) return

        lobbies.push({
          id: createLobbyId(),
          players: [{
            uuid: uuid,
            username: getNewLobbyUsername(uuid),
            color: getFreeColors()[0]
          }]
        })
        io.emit('updateLobbies', lobbies)
      })

      socket.on('joinLobby', (lobbyId: string, uuid: string) => {
        let newLobby = getLobbyById(lobbyId)

        if (newLobby.players.length < 4) {
          // Add player
          newLobby.players = [...newLobby.players, {
            uuid: uuid,
            username: getNewLobbyUsername(uuid, lobbyId),
            color: getFreeColors(lobbyId)[0]
          }]

          // Update lobbies
          updateLobbyInLobbies(newLobby)

          io.emit('updateLobbies', lobbies)
        }
      })

      socket.on('leaveLobby', (lobbyId: string, uuid: string) => {
        let newLobby = getLobbyById(lobbyId)

        // Remove player
        newLobby.players = newLobby.players.filter(p => p.uuid != uuid)

        // Update lobbies
        if (newLobby.players.length == 0) {
          lobbies = lobbies.filter(l => l.id != newLobby.id)
        } else {
          updateLobbyInLobbies(newLobby)
        }

        io.emit('updateLobbies', lobbies)
      })

      socket.on('updateUsername', (userName: string, uuid: string, lobbyId: string | undefined) => {
        if (!userName || !uuid) return

        players[uuid].username = userName

        let newLobby = !!lobbyId && getLobbyById(lobbyId)

        if (newLobby) {
          const newPlayer = newLobby?.players?.filter(p => p.uuid == uuid)[0]
          newLobby.players.splice(newLobby.players.indexOf(newPlayer), 1, {
            ...newPlayer,
            username: userName
          })

          // Update lobbies
          updateLobbyInLobbies(newLobby)
          io.emit('updateLobbies', lobbies)
        }
      })

      socket.on('changePlayerColor', (lobbyId: string, uuid: string) => {
        const newLobby = getLobbyById(lobbyId)
        const newPlayer = newLobby?.players?.filter(p => p.uuid == uuid)[0]
        const freeColors = getFreeColors(lobbyId)
        const nextColor = nextPlayerColor(newPlayer.color, [...freeColors, newPlayer.color])

        newLobby.players.splice(newLobby.players.indexOf(newPlayer), 1, {
          ...newPlayer,
          color: nextColor
        })

        // Update lobbies
        updateLobbyInLobbies(newLobby)

        io.emit('updateLobbies', lobbies)
      })

      socket.on('startGame', (lobbyId: string, uuid: string) => {
        const lobby = getLobbyById(lobbyId)

        if (!games[lobbyId]) {
          games[lobbyId] = {
            lobbyId: lobbyId,
            players: lobby.players,
            activePlayerColor: lobby.players.map(p => p.color)[0],
            turn: 1
          }
          lobbies = lobbies.filter(l => l.id != lobby.id)
          io.emit('triggerGameStart', lobbyId, lobby.players.map(p => p.uuid))
          socket.broadcast.emit('updateLobbies', lobbies)
        }
      })

      // Game interaction
      socket.on('getGameValidityAndColors', (lobbyId: string, uuid: string) => {
        const game = games[lobbyId]
        const playerColor = game?.players?.filter(p => p.uuid == uuid)[0]?.color

        socket.emit('getGameValidityAndColors', !!game, playerColor, game?.activePlayerColor, game?.players?.map(p => p.color), game?.turn > 1)

        // Find lobby player might be in and send game data
        if (game && game.data) {
          socket.emit('receiveGameUpdate', game.lobbyId, game.data.state, game.data.activePlayer, game.data.dice, game.data.blockers, game.data.playerPieces)
        }
      })

      socket.on('updateServerWithGameState', (
        lobbyId: string, 
        uuid: string,
        state: GameStates, 
        activePlayer: PlayerColor, 
        dice: number | undefined, 
        blockers: number[], 
        playerPieces: Piece[]
      ) => {
        const game = games[lobbyId]
        const player = game?.players?.find(p => p.uuid == uuid)
        const itsPlayersTurn = player?.color == game?.activePlayerColor

        if (game && player && itsPlayersTurn) {
          games[lobbyId].activePlayerColor = activePlayer
          games[lobbyId].turn += 1
          game.data = {
            state,
            activePlayer,
            dice,
            blockers,
            playerPieces
          }
          socket.broadcast.emit('receiveGameUpdate', lobbyId, state, activePlayer, dice, blockers, playerPieces)
        } else {
          console.error("Error executing turn!", game, lobbyId, player, uuid, itsPlayersTurn)
        }
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('user disconnected')
      })
    })
  }
  res.end()
}

export default SocketHandler