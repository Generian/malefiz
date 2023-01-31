import { useCallback, useEffect, useState } from 'react'
import styles from 'styles/Game.module.css'
import { DiceRoller } from 'src/game/DiceRoller'
import { Board } from './Board'
import { activeColors, nextPlayerColor, PlayerColor } from './resources/playerColors'
import { defaultBlocks, getResetPiecePosition, initialisePieces, positions, winningPosId } from './resources/positions'
import { getAvailableMovePaths } from './resources/routing'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { GameState, GameType, Piece } from './resources/gameTypes'
import { getPlayer, updatePlayers, getUuid, handleNewUuid } from 'src/utils/helper'
import { useRouter } from 'next/router'
import { Player, PublicPlayer } from 'src/pages'
import { Layout } from 'src/components/Layout'
import { Info, Infos } from './Infos'
import { PlayerOnlineState } from './PlayerOnlineState'
import { Action, initialiseGame, validateGameUpdate } from './resources/gameValidation'
import { Game } from 'src/pages/api/socket'
import useSound from 'use-sound'
import { constants } from 'buffer'
// import moveSound from 'src/public/sounds/move.mp3'
import useKeypress from 'react-use-keypress';



export const debugMode = false

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

const didPieceMove = (n: Piece[], o: Piece[]) => {
  let moved = false

  n.forEach(p => {
    if (!o.find(piece => p.pos == piece.pos && p.color == piece.color)) {
      moved = true
      // console.log("play sound")
    }
  })

  return moved
}

export const GameComp = () => {
  const router = useRouter()
  // const [play] = useSound(moveSound)
  const { lid, r, g, y, b } = router.query

  // Generic states
  const [gameType, setGameType] = useState<GameType>('NORMAL')
  const [players, setPlayers] = useState<Player[]>()
  const [pieces, setPieces] = useState<Piece[]>()
  const [blocks, setBlocks] = useState<number[]>(defaultBlocks)
  const [activePlayerColor, setActivePlayerColor] = useState<PlayerColor>() // FYI: This one is not required in competition mode, given that all players are active at the same time and their move right is only bound by the dice countdown.

  // Local-only data
  const [myColor, setMyColor] = useState<PlayerColor>()
  const [activePiece, setActivePiece] = useState<Piece>()
  const [tempPiece, setTempPiece] = useState<Piece>()
  const [tempBlock, setTempBlock] = useState<number>()
  const [diceValue, setDiceValue] = useState<number | undefined>(2)

  // Auxiliary state
  const [isOnlineGame, setIsOnlineGame] = useState(!!lid)
  const [infos, setInfos] = useState<Info[]>([])
  const [isGameOver, setIsGameOver] = useState(false)

  useKeypress('Enter', () => {
    playerRolledDice()
  })

  useEffect(() => {
    const p = getActivePlayer()
    if (p?.diceValue && p?.gameState != 'ROLL_DICE') {
      setDiceValue(p.diceValue)
    }
  }, [players])

  const updateGameStateWithNewGameData = (newGame: Game) => {
    // Set game details
    setGameType(newGame.gameType)
    setPlayers([...newGame.players])
    setPieces(pieces => {
      // Play move sound
      if (pieces && didPieceMove(newGame.pieces, pieces)) {
        // play()
      }
      return newGame.pieces
    })
    setBlocks(newGame.blocks)
    setActivePlayerColor(newGame.activePlayerColor)
    setInfos(newGame.infos)
    setIsGameOver(newGame.gameOver)
    setTempPiece(temp => {
      temp && setActivePiece(undefined)
      return undefined
    })
    setTempBlock(undefined)

    if (activePiece && !newGame.pieces.find(p => p.pos == activePiece.pos && p.color == activePiece.color)) {
      setActivePiece(undefined)
    }
  }

  const getGameFromLocalState = () => {
    if (!players || !activePlayerColor || !pieces) return
    return {
      lobbyId: '',
      gameType: gameType,
      players,
      activePlayerColor,
      blocks,
      pieces,
      cooldown: 0,
      gameOver: isGameOver,
      infos
    }
  }

  const validateAction = (action: Action) => {
    let valid = false

    const game = getGameFromLocalState()

    const playerColor = gameType == 'COMPETITION' ? myColor : activePlayerColor

    if (game && playerColor) {
      const { isValid } = validateGameUpdate({
        game: game, 
        color: playerColor, 
        action: action
      })
      valid = isValid
    }
    return valid
  }

  const validateActionAndUpdate = (action: Action) => {
    if (isOnlineGame) {
      updateServerWithGameState(action)
    } else {
      const game = getGameFromLocalState()

      const playerColor = gameType == 'COMPETITION' ? myColor : activePlayerColor

      if (game && playerColor) {
        const { isValid, reason, newGame } = validateGameUpdate({
          game: game, 
          color: playerColor, 
          action: action
        })

        if (!isValid) {
          console.error("Move failed! Reason:", reason)
          updateGameStateWithNewGameData(newGame)
        } else {
          console.log("Received game update (local):", newGame)
          updateGameStateWithNewGameData(newGame)
        }

      } else {
        console.error("Can't update local game state because game data is not valid.")
      }
    }
  }

  const getActivePlayer = () => {
    const playerColor = gameType == 'COMPETITION' ? myColor : activePlayerColor

    const player = players?.find(p => p.color == playerColor)

    return player
  }

  const getActivePlayerGameState = () => {
    return getActivePlayer()?.gameState
  }

  // Initialise local game
  useEffect(() => {
    if (!isOnlineGame) {
      const colorsFromParams = activeColors(!!r, !!g, !!y, !!b)
      const playersToInitialiseGame = colorsFromParams.length ? colorsFromParams : activeColors(true, true, true, true)
      const game = initialiseGame(playersToInitialiseGame, gameType, 0, undefined)

      updateGameStateWithNewGameData(game)
    }
  }, [router.query])

  // Connect socket in case of a multiplayer game
  useEffect(() => {
    if (typeof lid == 'string') {
      socketInitializer()
      setIsOnlineGame(true)
    }
  }, [lid])

  const socketInitializer = async () => {
    if (typeof lid != 'string') return

    console.log("Initialising socket")
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected', socket.id)

      socket.emit('requestUuid', lid, getUuid(), (newUuid, gameValidityData) => {
        handleNewUuid(newUuid)

        const { game, playerColor } = gameValidityData
        if (!game) {
          console.error("Game lobby ID is not valid. Redirecting back to Lobby.")
          router.push('/')
        } else if (!playerColor) {
          console.error("Player not in given game. Redirecting back to Lobby.")
          router.push('/')
        } else {
          // Set game details
          updateGameStateWithNewGameData(game)

          // Set player's color
          setMyColor(playerColor)
        }
      })
    })

    socket.on('receiveGameUpdate', (
      game
    ) => {
      if (game.lobbyId == lid) {
        console.log("Received game update:", game)
        updateGameStateWithNewGameData(game)
      } else {
        console.log("Received game update for another lobby.")
      }
    })

    socket.on('playerUpdate', (
      lobbyId,
      players
    ) => {
      if (lobbyId == lid && players) {
        console.log("Receive player update:", players)
        setPlayers(players)
      } else {
        console.log("Received player update for another lobby.")
      }
    })
  }

  // Multiplayer interaction
  const updateServerWithGameState = (
    action: Action
  ) => {
    if (typeof lid == 'string') {
      socket.emit('updateServerWithGameState', 
        lid, 
        getUuid(), 
        action,
        (isValid, reason) => {
          if (!isValid) {
            console.error("Move failed! Reason:", reason)
          }
        }
      )
    }
  }

  // Game interaction
  const myTurn = () => (myColor == activePlayerColor) || !lid || gameType == 'COMPETITION'

  const playerRolledDice = () => {
    const action: Action = {
      updateType: 'ROLL_DICE',
    }

    if (!validateAction(action)) return

    setDiceValue(undefined)

    setTimeout(() => {
      validateActionAndUpdate(action)
    }, 1000)
  }

  const playerSelectedPiece = (piece: Piece) => {
    if (!myTurn()) return

    const playerColor = gameType == 'COMPETITION' ? myColor : activePlayerColor

    const player = players?.find(p => p.color == playerColor)

    if (piece.color == playerColor && player?.gameState == 'MOVE_PIECE') {
      setActivePiece(piece)
    }
  }

  const moveActivePiece = (posId: number) => {
    const action: Action = {
      updateType: 'MOVE_PIECE',
      activePiece: activePiece,
      newPositionId: posId
    }

    if (!validateAction(action)) {
      if (activePiece?.pos == posId) {
        setActivePiece(undefined)
      }
      return
    }

    validateActionAndUpdate(action)

    if (activePiece) {
      gameType == 'COMPETITION' && setTempPiece({
        ...activePiece,
        pos: posId
      })
      // play()
    }
  }

  const moveBlock = (posId: number) => {
    const action: Action = {
      updateType: 'MOVE_BLOCK',
      newPositionId: posId
    }

    if (!validateAction(action)) return

    // play()
    validateActionAndUpdate(action)
    gameType == 'COMPETITION' && setTempBlock(posId)
  }

  const handleClick = (posId: number) => {
    if (!myTurn()) return

    const playerColor = gameType == 'COMPETITION' ? myColor : activePlayerColor

    const player = players?.find(p => p.color == playerColor)

    if (!player) {
      console.error("No player found to attribute board click to. My color:", myColor, "Active player color:", activePlayerColor)
      return
    }

    switch (player.gameState) {
      case 'MOVE_PIECE':
        moveActivePiece(posId)
        break

      case 'MOVE_BLOCK':
        moveBlock(posId)
        break
    
      default:
        console.warn("Unexpected click on board. Player:", player)
        break
    }
  }

  return (
    <div className={styles.container}>
      {(activePlayerColor && pieces && players) && <>
        <Layout 
          board={        
            <Board 
              pieces={pieces}
              paths={!!getActivePlayer()?.diceValue && !!activePiece && getActivePlayerGameState() == 'MOVE_PIECE' && !tempPiece && getAvailableMovePaths(
                activePiece.pos,
                getActivePlayer()?.color, 
                getActivePlayer()?.diceValue, 
                blocks, 
                pieces)}
              blocks={blocks}
              showBlockerCursor={getActivePlayer()?.gameState == 'MOVE_BLOCK' && !tempBlock}
              activePiece={activePiece}
              tempPiece={tempPiece}
              tempBlock={tempBlock}
              isGameOver={infos.find(i => i.infoType == 'GAMEOVER')}
              handleClick={handleClick}
              handlePieceClick={playerSelectedPiece}
            />
          }
          instructions={
            <div className={styles.infoContainer}>
              {!isGameOver && <DiceRoller
                diceValue = {diceValue}
                activePlayerColor={getActivePlayer()?.color}
                gameState = {getActivePlayer()?.gameState}
                nextMoveTime={getActivePlayer()?.nextMoveTime}
                handleClick={playerRolledDice}
              />}
              {isGameOver && <div className={styles.buttonContainer}>
                <button className={`button primary`} onClick={() => typeof lid == 'string' && socket.emit('startGame', lid, getUuid(), true)}>Play again</button>
                <button className={`button`} onClick={() => router.push('/')}>Back to Lobby</button>
              </div>}
              <div className={styles.bottomInfoContainer}>
                <Infos infos={infos}/>
                {!!lid && <PlayerOnlineState players={players} />}
              </div>
            </div>
          }
        />
      </>}
    </div>
  )
}