import styles from 'styles/Board.module.css'
import { positions } from 'src/game/resources/positions'
import { Position } from './Position'
import { PieceMarker } from './PieceMarker'
import { POSITION_SIZE, SPACING } from './resources/styles'
import { Decoration } from './Decoration'
import { Piece } from './resources/gameTypes'
import { useWindowSize } from 'src/utils/windowSize'
import { getSquareSize } from 'src/components/Layout'
import { BlockMarker } from './BlockMarker'
import { useEffect, useState } from 'react'
import { Info } from './Infos'
import { WinnerInfo } from './WinnerInfo'
import { isMobile } from 'react-device-detect'

interface BoardProps {
  pieces: Piece[]
  paths: number[][] | false
  blocks: number[]
  showBlockerCursor: boolean
  activePiece?: Piece
  isGameOver: Info | undefined
  handleClick: (posId: number) => void
  handlePieceClick: (piece: Piece) => void
}

export const Board = ({ 
  pieces,
  paths,
  blocks,
  showBlockerCursor,
  activePiece,
  isGameOver,
  handleClick,
  handlePieceClick
}: BoardProps) => {
  const windowSize = useWindowSize()
  const [mousePos, setMousePos] = useState<{x: number, y: number}>()

  useEffect(() => {
    const handleMouseMove = (event: { clientX: any; clientY: any }) => {
      setMousePos({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )
    }
  }, [])

  const boardSize = getSquareSize(windowSize) - 32
  const maxPosDimension = Math.max(...positions.map(p => p.x), ...positions.map(p => p.y))
  const spacing = boardSize / (maxPosDimension + 1)
  const positionSize = spacing * 0.8
  const pieceSize = positionSize * 0.85
  
  const fieldsToHighlight = paths && paths.map(p => p[p.length - 1])
  return (
    <div
      className={`${styles.container} background`}
      style={{ minWidth: boardSize, minHeight: boardSize }}
    >
      {showBlockerCursor && !isGameOver && !isMobile && <BlockMarker pieceSize={pieceSize} cursor={mousePos}/>}
      {activePiece && !isGameOver && !isMobile && <PieceMarker 
          piece={activePiece}
          cursor={mousePos}
          pieceSize={pieceSize}
        />}
      <Decoration 
        spacing={spacing}
        positionSize={positionSize}
      />
      {positions.map(pos => <Position 
        key={pos.id}
        id={pos.id}
        blocked={blocks?.includes(pos.id)}
        highlightMovePosition={fieldsToHighlight && fieldsToHighlight.includes(pos.id)}
        handleClick={handleClick}
        spacing={spacing}
        positionSize={positionSize}
        pieceSize={pieceSize}
      >
        {pieces
          .filter(piece => piece.pos == pos.id)
          .filter(piece => piece.pos != activePiece?.pos)
          .map((piece, i) => <PieceMarker 
            key={i}
            piece={piece}
            pieceSize={pieceSize}
            handleClick={handlePieceClick}
          />)
        }
      </Position>)}
      {isGameOver && <WinnerInfo info={isGameOver}/>}
    </div>
  )
}