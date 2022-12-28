import { useEffect, useState } from 'react'
import styles from 'styles/Game.module.css'
import { DiceRoller } from 'src/game/Dice'
import { Board } from './Board'
import { activeColors, nextPlayerColor, PlayerColor } from './resources/playerColors'
import { defaultBlocks, getResetPiecePosition, initialisePieces, positions, winningPosId } from './resources/positions'
import { getAvailableMovePaths } from './resources/routing'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { GameStates, Piece } from './resources/gameTypes'
import { getUuid } from 'src/utils/helper'
import { useRouter } from 'next/router'

export const debugMode = false

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

interface GameProps {

}

export const Game = ({  }: GameProps) => {
  const router = useRouter()
  const { lid } = router.query

  const [gameState, setGamestate] = useState<GameStates>('ROLL_DICE')
  const [activePlayerColor, setActivePlayerColor] = useState<PlayerColor>(activeColors[0])
  const [diceValue, setDiceValue] = useState<number | undefined>()
  const [blocks, setBlocks] = useState<number[]>(defaultBlocks)
  const [pieces, setPieces] = useState<Piece[]>(initialisePieces())
  const [activePiece, setActivePiece] = useState<Piece>()

  // Multiplayer states
  const [isLobby, setIsLobby] = useState(!!lid)
  const [myColor, setMyColor] = useState<PlayerColor>()

  useEffect(() => {
    initialiseMultiplayerGame()
  }, [])

  useEffect(() => {
    console.log("New dice value:", diceValue)
  }, [diceValue])

  const myTurn = () => (myColor == activePlayerColor) || !isLobby

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
        console.warn("No uuid set yet. Saving new uuid in cookie:", newUuid)
        document.cookie = `uuid=${newUuid}; expires=${new Date(new Date().getTime()+60*60*1000*24).toUTCString()}`
      } else {
        console.error("Received a mismatching uuid. Unexpected error.")
      }
    })

    socket.on('getGameValidityAndColor', (lobbyValid, playerColor, activePlayerColor) => {
      if (!lobbyValid) {
        console.error("Game lobby ID is not valid.", playerColor)
        router.push('/')
      } else {
        setMyColor(playerColor)
        setActivePlayerColor(activePlayerColor)
      }
    })

    socket.on('receiveGameUpdate', (lobbyId, state, activePlayer, dice, blockers, playerPieces) => {
      console.log("received new state")
      if (lobbyId == lid) {
        console.log("updating new state")
        setGamestate(state)
        setActivePlayerColor(activePlayer)
        setDiceValue(dice)
        setBlocks(blockers)
        setPieces(playerPieces)
      }
    })

  }

  // Multiplayer interaction
  const initialiseMultiplayerGame = async () => {
    if (typeof lid == 'string') {
      await socketInitializer()
      socket.emit('getGameValidityAndColor', lid, getUuid())
    }
  }

  const updateServerWithGameState = (
    state: GameStates = gameState,
    activePlayer: PlayerColor = activePlayerColor,
    dice: number | undefined = diceValue,
    blockers: number[] = blocks,
    playerPieces: Piece[] = pieces
  ) => {
    if (typeof lid == 'string') {
      socket.emit('updateServerWithGameState', lid, getUuid(), state, activePlayer, dice, blockers, playerPieces)
    }
  }

  // Game interaction
  const playerRolledDice = (
    value: number,
  ) => {
    if (!myTurn()) return
    if (gameState == 'ROLL_DICE') {
      setDiceValue(value)
      setGamestate('SELECT_PIECE')
      updateServerWithGameState('SELECT_PIECE', activePlayerColor, value)
    } else {
      console.warn("Rolled dice when not expected")
    }
  }

  const playerSelectedPiece = (piece: Piece) => {
    if (piece.color == activePlayerColor && (gameState == 'SELECT_PIECE' || gameState == 'MOVE_PIECE') && myTurn()) {
      setActivePiece(piece)
      setGamestate('MOVE_PIECE')
    }
  }

  const getNewPiecePositions = (piece: Piece, newPiecePosition: number, pieces: Piece[]) => {
    const index = pieces.findIndex(p => p.pos == piece.pos && p.color == piece.color)
    const newPieces = [...pieces.slice(0, index), { ...piece, pos: newPiecePosition}, ...pieces.slice(index + 1)] as Piece[]
    return newPieces
  }

  const moveActivePiece = (posId: number) => {
    const moveOptions = !!diceValue && !!activePiece && getAvailableMovePaths(activePiece.pos, activePlayerColor, diceValue, blocks, pieces).map(p => p[p.length - 1])
    debugMode && console.log("Available paths:", moveOptions)
    if (!!moveOptions && moveOptions.includes(posId)) {
      let newPiecePositions = getNewPiecePositions(activePiece, posId, pieces)
      let newGameState: GameStates = 'ROLL_DICE'
      let newDiceValue: number | undefined = diceValue
      let newActivePlayerColor: PlayerColor = activePlayerColor
      let newBlocks: number[] = blocks

      const otherPlayerPieces = pieces.filter(p => p.color != activePlayerColor)
      

      if (blocks.includes(posId)) {
        newBlocks = blocks.filter(b => b != posId) //Remove block from current position
        newGameState = 'MOVE_BLOCK'
      } else if (otherPlayerPieces.map(p => p.pos).includes(posId)) {
        const pieceToReset = otherPlayerPieces.filter(o => o.pos == posId)[0]
        newPiecePositions = getNewPiecePositions(pieceToReset, getResetPiecePosition(pieceToReset, newPiecePositions), newPiecePositions)
      }
  
      if (diceValue != 6 && !blocks.includes(posId)) {
        newActivePlayerColor = nextPlayerColor(activePlayerColor)
        newDiceValue = undefined
      }
      
      // Reset state
      setActivePiece(undefined)

      // Win condition
      if (posId == winningPosId) {
        setGamestate('END')
      }

      // Update states
      setGamestate(newGameState)
      setPieces(newPiecePositions)
      setActivePlayerColor(newActivePlayerColor)
      setDiceValue(newDiceValue)
      setBlocks(newBlocks)
      updateServerWithGameState(newGameState, newActivePlayerColor, newDiceValue, newBlocks, newPiecePositions)
    } else {
      console.warn("This is not a valid move option.")
    }
  }

  const moveBlock = (posId: number) => {
    const moveOptions = positions
      .filter(p => p.y > 1) // Filter out first rows
      .map(p => p.id)
      .filter(p => !blocks.includes(p)) // Filter for blocks
      .filter(p => !pieces.map(p => p.pos).includes(p)) // Filter out positions with players
    
    if (moveOptions.includes(posId)) {
      let newActivePlayerColor: PlayerColor = activePlayerColor
      if (diceValue != 6) {
        newActivePlayerColor = nextPlayerColor(activePlayerColor)
      }

      let newBlocks: number[] = [...blocks, posId]
      setBlocks(newBlocks)
      setGamestate('ROLL_DICE')
      setDiceValue(undefined)

      updateServerWithGameState('ROLL_DICE', newActivePlayerColor, undefined, newBlocks)
    } else {
      console.warn("Block can't be moved here!")
    }
  }

  const handleClick = (posId: number) => {
    if (!myTurn()) return
    switch (gameState) {
      case 'MOVE_PIECE':
        moveActivePiece(posId)
        break;

      case 'MOVE_BLOCK':
        moveBlock(posId)
        break
    
      default:
        console.warn("Unexpected click on board")
        break;
    }

  }

  return (
    <div className={styles.container}>
      <Board 
        pieces={pieces}
        paths={!!diceValue && !!activePiece && gameState == 'MOVE_PIECE' && getAvailableMovePaths(activePiece.pos, activePlayerColor, diceValue, blocks, pieces)}
        handleClick={handleClick}
        handlePieceClick={playerSelectedPiece}
        blocks={blocks}
      />
      <div className={styles.infoContainer}>
        {gameState == 'END' && <div className={styles.default}>
          <span>Winner: {pieces.filter(p => p.pos == winningPosId)[0].color}</span>
        </div>}
        {myColor && <div className={styles.default}><span>Your color: </span><span className={`${styles[myColor]} ${styles.bold}`}>{myColor}</span></div>}
        <div className={styles.default}>
          <span className={`${styles[activePlayerColor]} ${styles.bold}`}>{activePlayerColor}</span>{(gameState == 'MOVE_PIECE' || gameState == 'SELECT_PIECE') ? ` rolled ${diceValue} and` : ''}<span> should </span><span className={styles.bold}>{gameState}</span><span>.</span>
        </div>
        <DiceRoller setDiceValue={playerRolledDice} disabled={gameState != 'ROLL_DICE'}/>
        {debugMode && <button onClick={() => console.log("pieces:", pieces)}>Print pieces</button>}
      </div>
    </div>
  )
}