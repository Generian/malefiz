import { Server } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import { v4 } from 'uuid'
import { Lobby, Player, PublicPlayer } from '..'
import { createLobbyId } from 'src/utils/helper'
import { nextPlayerColor, PlayerColor } from 'src/game/resources/playerColors'
import { GameState, GameType, Piece } from 'src/game/resources/gameTypes'

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
  globalUsername?: string,
  online?: boolean
}

interface Users {
  [key: string]: User
}

export interface Game {
  lobbyId: string
  players: Player[]
  activePlayerColor: PlayerColor
  turn: number
  data?: {
    state: GameState, 
    activePlayer: PlayerColor, 
    dice: number | undefined, 
    blockers: number[], 
    playerPieces: Piece[]
  }
  gameType?: GameType
  cooldown: number
}

interface Games {
  [key: string]: Game
}

export interface GameValidityData {
  isLobbyValid: boolean
  playerColor: PlayerColor | false
  isGameInPlay: boolean
  game: Game | false
}

const SocketHandler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res?.socket?.server?.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    // Set variables
    const users: Users = {}
    let lobbies: Lobby[] = []
    const games: Games = {}

    const getUuidBySocketId = (socketId: string) => {
      return Object.keys(users).find(uuid => users[uuid].sockets.includes(socketId))
    }

    const getLobbyById = (lobbyId: string | undefined) => lobbies.find(l => l.id == lobbyId)

    const updateLobbyInLobbies = (newLobby: Lobby) => {
      const index = lobbies.indexOf(lobbies.filter(l => l.id == newLobby.id)[0])
      lobbies.splice(index, 1, newLobby)
      return
    }

    const getNewLobbyUsername = (uuid: string, lobbyId?: string) => {
      let newLobbyUsername = users[uuid]?.globalUsername
      if (!newLobbyUsername) {
        newLobbyUsername = "Player 1"
        let i = 1
        const lobby = getLobbyById(lobbyId)
        if (lobby) {
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
      const lobby = getLobbyById(lobbyId)
      if (lobby) {
        lobby.players.forEach(p => {
          freeColors = freeColors.filter(c => c != p.color)
        })
      }
      return freeColors
    }

    const getPublicPlayers = (lobbyId: string): PublicPlayer[] | undefined => {
      const game = games[lobbyId]
      if (!game) return
      return game.players.map(p => {
        return {
          username: p.username,
          color: p.color,
          nextMoveTime: p.nextMoveTime,
          gameState: p.gameState,
          diceValue: p.diceValue,
          online: users[p.uuid].online
        }
      })
    }

    const updateOnlineStatus = (uuid: string, isOnline: boolean) => {
      // Update online status
      users[uuid].online = isOnline

      // Update lobbies
      lobbies.forEach((l, lobbyIndex) => l.players.forEach((p, playerIndex) => {
        if (p.uuid == uuid) {
          lobbies[lobbyIndex].players[playerIndex].online = isOnline
        }
      }))

      // Update games
      Object.entries(games).forEach(entry => {
        const [lobbyId, game] = entry
        game.players.forEach((p, playerIndex) => {
          if (p.uuid == uuid) {
            games[lobbyId].players[playerIndex].online = isOnline
          }
        })
      })
    }

    // Logic starts here
    io.on('connection', socket => {

      // Set user uuid
      socket.on('requestUuid', (
        lid: string | undefined, 
        uuid: string | undefined, 
        callback: (
          newUuid: string, 
          gameValidityData: GameValidityData
        ) => void
      ) => {
        let newUuid = uuid
        if (newUuid && uuid) {
          const user = users[uuid]
          if (user) {
            updateOnlineStatus(uuid, true)

            // Store socketId
            if (!user.sockets.includes(socket.id)) {
              users[uuid] = {
                ...user,
                sockets: [...users[uuid].sockets, socket.id],
              }
            }
          } else {
            users[uuid] = {
              sockets: [socket.id],
              online: true
            }
          }
        } else {
          newUuid = v4()
          users[newUuid] = {
            sockets: [socket.id],
            online: true
          }
        }

        // socket.emit('receiveUuid', newUuid)

        const game = !!lid && games[lid]
        const playerColor = game && game.players?.filter(p => p.uuid == uuid)[0]?.color

        const gameValidityData: GameValidityData = {
          isLobbyValid: !!game,
          playerColor: playerColor,
          isGameInPlay: game && game?.turn > 1,
          game: game          
        }

        // Update the client
        callback(newUuid, gameValidityData)

        // Update all users
        io.emit('updateLobbies', lobbies, Object.values(games))

        // Find lobby player might be in and send game data
        if (game && game.data) {
          io.emit('receiveGameUpdate', game, getPublicPlayers(game.lobbyId))
        }

        if (game) {
          io.emit('playerUpdate', game.lobbyId, getPublicPlayers(game.lobbyId))
        }
      })

      // Lobbies handling
      socket.on('createLobby', uuid => {
        const player = users[uuid]
        if (!player) return

        lobbies.push({
          id: createLobbyId(),
          gameType: 'NORMAL',
          cooldown: 5,
          players: [{
            uuid: uuid,
            username: getNewLobbyUsername(uuid),
            color: getFreeColors()[0],
            online: player.online
          }]
        })
        io.emit('updateLobbies', lobbies)
      })

      socket.on('changeLobbySettings', (uuid: string, lobbyId: string, gameType: GameType, cooldown: number) => {
        let newLobby = getLobbyById(lobbyId)

        if (newLobby) {
          newLobby.gameType = gameType
          newLobby.cooldown = cooldown

          // Update lobbies
          updateLobbyInLobbies(newLobby)

          io.emit('updateLobbies', lobbies)
        }
      })

      socket.on('joinLobby', (lobbyId: string, color: PlayerColor, uuid: string) => {
        let newLobby = getLobbyById(lobbyId)
        const player = users[uuid]

        if (newLobby && newLobby.players.length < 4 && getFreeColors(lobbyId).includes(color) && player) {
          // Add player
          newLobby.players = [...newLobby.players, {
            uuid: uuid,
            username: getNewLobbyUsername(uuid, lobbyId),
            color: color,
            online: player.online
          }]

          // Update lobbies
          updateLobbyInLobbies(newLobby)

          io.emit('updateLobbies', lobbies)
        }
      })

      socket.on('leaveLobby', (lobbyId: string, uuid: string) => {
        let newLobby = getLobbyById(lobbyId)

        if (newLobby) {
          // Remove player
          newLobby.players = newLobby.players.filter(p => p.uuid != uuid)

          // Update lobbies
          if (newLobby.players.length == 0) {
            lobbies = lobbies.filter(l => l.id != newLobby?.id)
          } else {
            updateLobbyInLobbies(newLobby)
          }

          io.emit('updateLobbies', lobbies)
        }
      })

      socket.on('updateUsername', (userName: string, uuid: string, lobbyId: string | undefined) => {
        if (!userName || !uuid) return

        users[uuid].globalUsername = userName

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

      socket.on('changePlayerColor', (lobbyId: string, color: PlayerColor | undefined, uuid: string) => {
        const newLobby = getLobbyById(lobbyId)
        if (newLobby) {
          const newPlayer = newLobby?.players?.filter(p => p.uuid == uuid)[0]
          const freeColors = getFreeColors(lobbyId)
          const nextColor = (color && freeColors.includes(color)) ? color : nextPlayerColor(newPlayer.color, [...freeColors, newPlayer.color])

          newLobby.players.splice(newLobby.players.indexOf(newPlayer), 1, {
            ...newPlayer,
            color: nextColor
          })

          // Update lobbies
          updateLobbyInLobbies(newLobby)

          io.emit('updateLobbies', lobbies)
        }
      })

      socket.on('startGame', (lobbyId: string, uuid: string, gameType: GameType, cooldown: number) => {
        const lobby = getLobbyById(lobbyId)

        if (!games[lobbyId] && lobby) {
          games[lobbyId] = {
            lobbyId: lobbyId,
            players: lobby.players.map(p => {
              return {
                ...p,
                nextMoveTime: new Date().getTime(),
                gameState: 'ROLL_DICE'
              }
            }),
            activePlayerColor: lobby.players.map(p => p.color)[0],
            turn: 1,
            gameType: gameType,
            cooldown: cooldown
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

        socket.emit('getGameValidityAndColors', !!game, playerColor, game?.activePlayerColor, game?.turn > 1, getPublicPlayers(lobbyId), game?.gameType)

        // Find lobby player might be in and send game data
        if (game && game.data) {
          socket.emit('receiveGameUpdate', 
            game,
            getPublicPlayers(game.lobbyId),
          )
        }
      })

      socket.on('updateServerWithGameState', (
        lobbyId: string, 
        uuid: string,
        state: GameState, 
        activePlayer: PlayerColor, 
        dice: number | undefined, 
        blockers: number[], 
        playerPieces: Piece[],
        newPlayers: PublicPlayer[]
      ) => {
        const game = games[lobbyId]
        const player = game?.players?.find(p => p.uuid == uuid)
        const itsPlayersTurn = (player?.color == game?.activePlayerColor) || (game?.gameType == 'COMPETITION' && player?.nextMoveTime && player?.nextMoveTime <= new Date().getTime())

        if (game && player && itsPlayersTurn) {
          if (game?.gameType == 'COMPETITION') {
            games[lobbyId].players = game?.players?.map(p => {
              const newPlayer = newPlayers.filter(p => p.color == player.color)[0]
              if (p.color == player.color) {
                return {
                  ...newPlayer,
                  uuid: p.uuid,
                  nextMoveTime: (newPlayer.gameState == 'ROLL_DICE' && newPlayer.diceValue != 6) ? new Date().getTime() + 5 * 1000 : player.nextMoveTime,
                }
              } else {
                return p
              }
            })
          }
          games[lobbyId].activePlayerColor = activePlayer
          games[lobbyId].turn += 1
          game.data = {
            state,
            activePlayer,
            dice,
            blockers,
            playerPieces
          }
          socket.broadcast.emit('receiveGameUpdate', game, getPublicPlayers(lobbyId))
        } else {
          console.error("Error executing turn!", game, lobbyId, player, uuid, itsPlayersTurn)
        }
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        const uuid = getUuidBySocketId(socket.id)
        
        if (uuid) {
          updateOnlineStatus(uuid, false)

          // Inform users
          io.emit('updateLobbies', lobbies)

          // Update games
          Object.values(games).forEach(game => {
            if (game.players.map(p => p.uuid).includes(uuid)) {
              io.emit('playerUpdate', game.lobbyId, getPublicPlayers(game.lobbyId))
            }
          })

          console.log('player disconnected:', users[uuid]?.globalUsername)
        } else {
          console.warn('user without uuid disconnected:', socket.id)
        }
      })
    })
  }
  res.end()
}

export default SocketHandler