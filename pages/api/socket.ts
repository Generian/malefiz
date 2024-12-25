import { Server } from "socket.io"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Server as HTTPServer } from "http"
import { Socket as NetSocket } from "net"
import type { Server as IOServer } from "socket.io"
import { v4 } from "uuid"
import { Lobby, Player, PublicPlayer } from ".."
import { createLobbyId } from "src/utils/helper"
import {
  botNames,
  nextPlayerColor,
  PlayerColor,
} from "src/game/resources/playerColors"
import { GameState, GameType, Piece } from "src/game/resources/gameTypes"
import {
  Action,
  initialiseGame,
  validateGameUpdate,
} from "src/game/resources/gameValidation"
import { Info } from "src/game/Infos"
import { executeBotMove } from "src/game/resources/botExecutor"
import { getShortestPathsToFinish } from "src/game/resources/routing"
import {
  informSlackAbountLobbyCreation,
  informSlackAboutGameStart,
} from "src/utils/slackHelper"
import { saveGametoDatabase } from "src/prisma/database"

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
  sockets: string[]
  globalUsername?: string
  online?: boolean
}

interface Users {
  [key: string]: User
}

export interface Game {
  lobbyId: string
  gameType: GameType
  players: Player[]
  activePlayerColor: PlayerColor
  blocks: number[]
  pieces: Piece[]
  cooldown: number
  gameOver: boolean
  actions?: Action[]
  infos: Info[]
}

interface Games {
  [key: string]: Game
}

interface BotExecutor {
  [key: string]: any
}

export interface GameValidityData {
  game: Game | undefined
  playerColor: PlayerColor | undefined
}

const SocketHandler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res?.socket?.server?.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    // Set constants
    const shortestMovePaths = getShortestPathsToFinish()

    // Set variables
    const users: Users = {}
    let lobbies: Lobby[] = []
    const games: Games = {}
    const botExecutor: BotExecutor = {}

    const getUuidBySocketId = (socketId: string) => {
      return Object.keys(users).find((uuid) =>
        users[uuid].sockets.includes(socketId)
      )
    }

    const getLobbyById = (lobbyId: string | undefined) =>
      lobbies.find((l) => l.id == lobbyId)

    const updateLobbyInLobbies = (newLobby: Lobby) => {
      const index = lobbies.indexOf(
        lobbies.filter((l) => l.id == newLobby.id)[0]
      )
      lobbies.splice(index, 1, newLobby)
      return
    }

    const removeLobbyWhenAllPlayersOffline = (l: Lobby) => {
      let keepLobby = false

      l.players.forEach((p) => {
        if (p.online && !p.isBot) {
          keepLobby = true
        }
      })

      if (!keepLobby) {
        lobbies = lobbies.filter((lobby) => lobby.id != l.id)
      }
    }

    const getNewLobbyUsername = (uuid: string, lobbyId?: string) => {
      let newLobbyUsername = users[uuid]?.globalUsername
      if (!newLobbyUsername) {
        newLobbyUsername = "Player 1"
        let i = 1
        const lobby = getLobbyById(lobbyId)
        if (lobby) {
          while (
            lobby.players.map((p) => p.username).includes(newLobbyUsername)
          ) {
            i += 1
            newLobbyUsername = `Player ${i}`
          }
        }
      }
      return newLobbyUsername
    }

    const getFreeColors = (lobbyId?: string) => {
      let freeColors: PlayerColor[] = ["RED", "GREEN", "YELLOW", "BLUE"]
      const lobby = getLobbyById(lobbyId)
      if (lobby) {
        lobby.players.forEach((p) => {
          freeColors = freeColors.filter((c) => c != p.color)
        })
      }
      return freeColors
    }

    const getPlayersWithOnlineState = (
      lobbyId: string
    ): Player[] | undefined => {
      const game = games[lobbyId]
      if (!game) return
      return game.players.map((p) => {
        return {
          ...p,
          online: p.isBot ? true : users[p.uuid]?.online,
        }
      })
    }

    const getGameWithPlayerOnlineState = (
      lobbyId: string
    ): Game | undefined => {
      const game = games[lobbyId]
      const players = getPlayersWithOnlineState(lobbyId)
      if (!game || !players) return
      return {
        ...game,
        players: players,
      }
    }

    const updateOnlineStatus = (uuid: string, isOnline: boolean) => {
      // Update online status
      users[uuid].online = isOnline

      // Update lobbies
      lobbies.forEach((l, lobbyIndex) => {
        l.players.forEach((p, playerIndex) => {
          if (p.uuid == uuid) {
            lobbies[lobbyIndex].players[playerIndex].online = isOnline
          }
        })
        removeLobbyWhenAllPlayersOffline(l)
      })

      // Update games
      Object.entries(games).forEach((entry) => {
        const [lobbyId, game] = entry
        game.players.forEach((p, playerIndex) => {
          if (p.uuid == uuid) {
            games[lobbyId].players[playerIndex].online = isOnline
          }
        })
      })
    }

    const handleGameAction = (
      lobbyId: string,
      uuid: string,
      action: Action,
      callback?: (isValid: boolean, reason: string) => void
    ) => {
      const game = games[lobbyId]
      const player = game?.players?.find((p) => p.uuid == uuid)

      if (game && player) {
        let { isValid, reason, newGame } = validateGameUpdate({
          game,
          color: player.color,
          action,
        })

        callback && callback(isValid, reason)

        if (isValid) {
          games[lobbyId] = newGame
          const game = getGameWithPlayerOnlineState(lobbyId)

          // Check if game is over and remove botExecutor
          if (game?.gameOver) {
            clearInterval(botExecutor[lobbyId])
          }

          if (game) {
            io.emit("receiveGameUpdate", game)
            saveGametoDatabase(game)
          } else {
            console.error(
              "No game found for distribution although update was valid."
            )
          }
        } else {
          console.warn("Game update invalid. Rejecting update. Reason:", reason)
        }
      } else {
        console.error(
          "Error executing turn! No game or player found. Game:",
          game,
          "Player:",
          player
        )
      }
    }

    // Logic starts here
    io.on("connection", (socket) => {
      // Set user uuid
      socket.on(
        "requestUuid",
        (
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
                online: true,
              }
            }
          } else {
            newUuid = v4()
            users[newUuid] = {
              sockets: [socket.id],
              online: true,
            }
          }

          // Find game that player might be in and attach it to the data package
          const game = !!lid ? getGameWithPlayerOnlineState(lid) : undefined
          const playerColor =
            game && game.players?.find((p) => p.uuid == uuid)?.color

          const dataReturned: GameValidityData = {
            game,
            playerColor,
          }

          // Update the client
          callback(newUuid, dataReturned)

          // Update all users
          io.emit("updateLobbies", lobbies, Object.values(games))

          if (game) {
            io.emit(
              "playerUpdate",
              game.lobbyId,
              getPlayersWithOnlineState(game.lobbyId)
            )
          }
        }
      )

      // Lobbies handling
      socket.on("createLobby", (uuid, callback) => {
        const player = users[uuid]
        if (!player) return

        const lid = createLobbyId()

        lobbies.push({
          id: lid,
          gameType: "NORMAL",
          cooldown: 5,
          players: [
            {
              uuid: uuid,
              username: getNewLobbyUsername(uuid),
              color: getFreeColors()[0],
              online: player.online,
            },
          ],
        })
        io.emit("updateLobbies", lobbies)
        callback(lid)

        // Inform Slack channel about lobby creation
        informSlackAbountLobbyCreation(player?.globalUsername, lid)
      })

      socket.on(
        "changeLobbySettings",
        (
          uuid: string,
          lobbyId: string,
          gameType: GameType,
          cooldown: number
        ) => {
          let newLobby = getLobbyById(lobbyId)

          if (newLobby) {
            newLobby.gameType = gameType
            newLobby.cooldown = cooldown

            // Update lobbies
            updateLobbyInLobbies(newLobby)

            io.emit("updateLobbies", lobbies)
          }
        }
      )

      socket.on(
        "joinLobby",
        (lobbyId: string, color: PlayerColor | undefined, uuid: string) => {
          let newLobby = getLobbyById(lobbyId)
          const player = users[uuid]

          if (newLobby && newLobby.players.length < 4) {
            const freeColors = getFreeColors(lobbyId)
            if ((!color || freeColors.includes(color)) && player) {
              // Add player
              newLobby.players = [
                ...newLobby.players,
                {
                  uuid: uuid,
                  username: getNewLobbyUsername(uuid, lobbyId),
                  color: !color ? freeColors[0] : color,
                  online: player.online,
                },
              ]

              // Update lobbies
              updateLobbyInLobbies(newLobby)

              io.emit("updateLobbies", lobbies)
            }
          }
        }
      )

      socket.on(
        "addBotToLobby",
        (lobbyId: string, color: PlayerColor, uuid: string) => {
          let newLobby = getLobbyById(lobbyId)
          const player = users[uuid]

          if (
            newLobby &&
            newLobby.players.length < 4 &&
            getFreeColors(lobbyId).includes(color) &&
            player &&
            newLobby.players.find((p) => p.uuid == uuid)
          ) {
            // Add bot
            newLobby.players = [
              ...newLobby.players,
              {
                uuid: v4(),
                username: `${botNames[color]} [Bot]`,
                color: color,
                isBot: true,
              },
            ]

            // Update lobbies
            updateLobbyInLobbies(newLobby)

            io.emit("updateLobbies", lobbies)
          }
        }
      )

      socket.on("leaveLobby", (lobbyId: string, uuid: string) => {
        let newLobby = getLobbyById(lobbyId)

        if (!lobbyId) {
          newLobby = lobbies.find((l) => l.players.find((p) => p.uuid == uuid))
        }

        if (newLobby) {
          // Remove player
          newLobby.players = newLobby.players.filter((p) => p.uuid != uuid)

          // Update lobbies
          if (newLobby.players.length == 0) {
            lobbies = lobbies.filter((l) => l.id != newLobby?.id)
          } else {
            updateLobbyInLobbies(newLobby)
          }

          removeLobbyWhenAllPlayersOffline(newLobby)

          io.emit("updateLobbies", lobbies)
        }
      })

      socket.on(
        "removeBotFromLobby",
        (lobbyId: string, color: string, uuid: string) => {
          let newLobby = getLobbyById(lobbyId)

          if (newLobby && newLobby.players.find((p) => p.uuid == uuid)) {
            const bot = newLobby.players.filter(
              (p) => p.color == color && p.isBot
            )

            if (bot.length) {
              // Remove bot
              newLobby.players = newLobby.players.filter(
                (p) => p.color != color
              )

              // Update lobbies
              if (newLobby.players.length == 0) {
                lobbies = lobbies.filter((l) => l.id != newLobby?.id)
              } else {
                updateLobbyInLobbies(newLobby)
              }

              removeLobbyWhenAllPlayersOffline(newLobby)

              io.emit("updateLobbies", lobbies)
            }
          }
        }
      )

      socket.on(
        "updateUsername",
        (userName: string, uuid: string, lobbyId: string | undefined) => {
          if (!userName || !uuid) return

          users[uuid].globalUsername = userName

          let newLobby = !!lobbyId && getLobbyById(lobbyId)

          if (newLobby) {
            const newPlayer = newLobby?.players?.filter(
              (p) => p.uuid == uuid
            )[0]
            newLobby.players.splice(newLobby.players.indexOf(newPlayer), 1, {
              ...newPlayer,
              username: userName,
            })

            // Update lobbies
            updateLobbyInLobbies(newLobby)
            io.emit("updateLobbies", lobbies)
          }
        }
      )

      socket.on(
        "changePlayerColor",
        (lobbyId: string, color: PlayerColor | undefined, uuid: string) => {
          const newLobby = getLobbyById(lobbyId)
          if (newLobby) {
            const newPlayer = newLobby?.players?.filter(
              (p) => p.uuid == uuid
            )[0]
            const freeColors = getFreeColors(lobbyId)
            const nextColor =
              color && freeColors.includes(color)
                ? color
                : nextPlayerColor(newPlayer.color, [
                    ...freeColors,
                    newPlayer.color,
                  ])

            newLobby.players.splice(newLobby.players.indexOf(newPlayer), 1, {
              ...newPlayer,
              color: nextColor,
            })

            // Update lobbies
            updateLobbyInLobbies(newLobby)

            io.emit("updateLobbies", lobbies)
          }
        }
      )

      socket.on(
        "startGame",
        (lobbyId: string, uuid: string, restart: boolean | undefined) => {
          let lobby: Lobby | Game | undefined = getLobbyById(lobbyId)

          if (restart) {
            lobby = games[lobbyId]
          }

          const isPlayerInLobby = !!lobby?.players.find((p) => p.uuid == uuid)

          if (!isPlayerInLobby) {
            console.error("Player is not in lobby and can't start game.")
            return
          }

          if (lobby) {
            // Create new game
            const newGame = initialiseGame(
              lobby.players,
              lobby.gameType,
              lobby.cooldown,
              lobbyId
            )
            games[lobbyId] = newGame
            saveGametoDatabase(newGame)

            // Start bot executor
            const hasBot = newGame.players.filter((p) => p.isBot).length > 0
            if (hasBot) {
              botExecutor[lobbyId] = setInterval(() => {
                const game = games[lobbyId]
                game.players
                  .filter((p) => p.isBot)
                  .forEach((p) => {
                    executeBotMove(
                      game,
                      p.color,
                      shortestMovePaths,
                      (action: Action) =>
                        handleGameAction(lobbyId, p.uuid, action)
                    )
                  })
              }, 3000)
            }

            if (restart) {
              io.emit("receiveGameUpdate", games[lobbyId])
            } else {
              // Start game for lobby
              io.emit(
                "startGame",
                lobbyId,
                lobby.players.map((p) => p.uuid)
              )

              // Remove game lobby from lobbies
              lobbies = lobbies.filter((l) => l.id != lobbyId)

              // Update all other lobbies
              socket.broadcast.emit("updateLobbies", lobbies)
            }

            // Inform Slack channel about lobby creation
            informSlackAboutGameStart(
              newGame.players.map((p) => p.username),
              lobbyId
            )
          }
        }
      )

      socket.on(
        "updateServerWithGameState",
        (
          lobbyId: string,
          uuid: string,
          action: Action,
          callback: (isValid: boolean, reason: string) => void
        ) => {
          handleGameAction(lobbyId, uuid, action, callback)
          // const game = games[lobbyId]
          // const player = game?.players?.find(p => p.uuid == uuid)

          // if (game && player) {
          //   let { isValid, reason, newGame } = validateGameUpdate({ game, color: player.color, action })

          //   callback(isValid, reason)

          //   if (isValid) {
          //     games[lobbyId] = newGame
          //     const game = getGameWithPlayerOnlineState(lobbyId)

          //     // Check if game is over and remove botExecutor
          //     if (game?.gameOver) {
          //       clearInterval(botExecutor[lobbyId])
          //     }

          //     if (game) {
          //       io.emit('receiveGameUpdate', game)
          //     } else {
          //       console.error("No game found for distribution although update was valid.")
          //     }
          //   } else {
          //     console.warn("Game update invalid. Rejecting update. Reason:", reason)
          //   }

          // } else {
          //   console.error("Error executing turn! No game or player found. Game:", game, "Player:", player)
          // }
        }
      )

      // Handle disconnect
      socket.on("disconnect", () => {
        const uuid = getUuidBySocketId(socket.id)

        if (uuid) {
          updateOnlineStatus(uuid, false)

          // Inform users
          io.emit("updateLobbies", lobbies)

          // Update games
          Object.values(games).forEach((game) => {
            if (game.players.map((p) => p.uuid).includes(uuid)) {
              io.emit(
                "playerUpdate",
                game.lobbyId,
                getPlayersWithOnlineState(game.lobbyId)
              )
            }
          })

          console.log("player disconnected:", users[uuid]?.globalUsername)
        } else {
          console.warn("user without uuid disconnected:", socket.id)
        }
      })
    })
  }
  res.end()
}

export default SocketHandler
