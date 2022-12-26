import { useEffect, useState } from 'react'
import styles from 'styles/Game.module.css'
import { DiceRoller } from 'src/game/Dice'
import { Board } from './Board'
import { nextPlayerColor, PlayerColor } from './resources/playerColors'
import { defaultBlocks, getResetPiecePosition, initialisePieces, positions, winningPosId } from './resources/positions'
import { getAvailableMovePaths } from './resources/routing'

export const debugMode = false

export interface Piece {
  pos: number
  color: PlayerColor
}

export type GameStates = 'ROLL_DICE' | 'SELECT_PIECE' | 'MOVE_PIECE' | 'MOVE_BLOCK' | 'END'

interface GameProps {
}

export const Game = ({  }: GameProps) => {
  const [gameState, setGamestate] = useState<GameStates>('ROLL_DICE')
  const [activePlayerColor, setActivePlayerColor] = useState<PlayerColor>('RED')
  const [diceValue, setDiceValue] = useState<number | undefined>(1)
  const [blocks, setBlocks] = useState<number[]>(defaultBlocks)
  const [pieces, setPieces] = useState<Piece[]>(initialisePieces())
  const [activePiece, setActivePiece] = useState<Piece>()

  const playerRolledDice = (
    value: number,
    playerId?: number,
  ) => {
    if (gameState == 'ROLL_DICE') {
      setDiceValue(value)
      setGamestate('SELECT_PIECE')
    } else {
      throw new Error("Rolled dice when not expected")
    }
  }

  const playerSelectedPiece = (piece: Piece) => {
    if (piece.color == activePlayerColor && (gameState == 'SELECT_PIECE' || gameState == 'MOVE_PIECE')) {
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

      const otherPlayerPieces = pieces.filter(p => p.color != activePlayerColor)

      if (blocks.includes(posId)) {
        setBlocks(blocks.filter(b => b != posId)) //Remove block from current position
        setGamestate('MOVE_BLOCK')
      } else if (otherPlayerPieces.map(p => p.pos).includes(posId)) {
        const pieceToReset = otherPlayerPieces.filter(o => o.pos == posId)[0]
        newPiecePositions = getNewPiecePositions(pieceToReset, getResetPiecePosition(pieceToReset, newPiecePositions), newPiecePositions)
        setGamestate('ROLL_DICE')
      } else {
        setGamestate('ROLL_DICE')
      }

      setPieces(newPiecePositions)
  
      if (diceValue != 6) {
        setActivePlayerColor(nextPlayerColor(activePlayerColor))
      }
      
      // Reset state
      setDiceValue(undefined)
      setActivePiece(undefined)

      // Win condition
      if (posId == winningPosId) {
        setGamestate('END')
      }
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
      setBlocks([...blocks, posId])
      setGamestate('ROLL_DICE')
    } else {
      console.warn("Block can't be moved here!")
    }
  }

  const handleClick = (posId: number) => {
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
        <div className={styles.default}>
          <span className={`${styles[activePlayerColor]} ${styles.bold}`}>{activePlayerColor}</span><span> to play and </span><span className={styles.bold}>{gameState}</span><span>.</span>
        </div>
        <DiceRoller diceValue={diceValue} setDiceValue={playerRolledDice} isActive={gameState == 'ROLL_DICE'}/>
        {debugMode && <button onClick={() => console.log("pieces:", pieces)}>Print pieces</button>}
      </div>
    </div>
  )
}