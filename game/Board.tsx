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
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Info } from './Infos'
import { WinnerInfo } from './WinnerInfo'
import { isMobile } from 'react-device-detect'
import { UPDATE_MOVE_PIECE } from './resources/gameValidation'
import { PieceMoveAnimation } from './PieceMoveAnimation'

interface BoardProps {
  pieces: Piece[]
  paths: number[][] | false
  blocks: number[]
  showBlockerCursor: boolean
  activePiece?: Piece
  tempPiece?: Piece
  tempBlock?: number
  piecesToAnimate: UPDATE_MOVE_PIECE[] 
  setPiecesToAnimate: Dispatch<SetStateAction<UPDATE_MOVE_PIECE[]>>
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
  tempPiece,
  tempBlock,
  piecesToAnimate,
  setPiecesToAnimate,
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

  let { boardSize } = getSquareSize(windowSize)
  boardSize -= 32
  const maxPosDimension = Math.max(...positions.map(p => p.x), ...positions.map(p => p.y))
  const spacing = boardSize / (maxPosDimension + 1)
  const positionSize = spacing * 0.8
  const pieceSize = positionSize * 0.85
  
  const fieldsToHighlight = paths && paths.map(p => p[p.length - 1])
  const piecePositionsToAnimate = piecesToAnimate.map(p => p.newPositionId)

  return (
    <div
      className={`${styles.container} background`}
      style={{ minWidth: boardSize, minHeight: boardSize }}
    >
      {(showBlockerCursor || (tempPiece?.pos && blocks?.includes(tempPiece?.pos))) && !isGameOver && !isMobile && <BlockMarker pieceSize={pieceSize} cursor={mousePos}/>}
      {activePiece && !tempPiece && !isGameOver && !isMobile && <PieceMarker 
          piece={activePiece}
          cursor={mousePos}
          pieceSize={pieceSize}
        />}
      <Decoration 
        spacing={spacing}
        positionSize={positionSize}
      />
      <PieceMoveAnimation
        piecesToAnimate={piecesToAnimate}
        setPiecesToAnimate={setPiecesToAnimate}
        spacing={spacing}
        positionSize={positionSize}
        pieceSize={pieceSize}
      />
      {positions.map(pos => <Position 
        key={pos.id}
        id={pos.id}
        blocked={blocks?.includes(pos.id) && tempPiece?.pos != pos.id}
        tempBlock={tempBlock == pos.id}
        highlightMovePosition={fieldsToHighlight && fieldsToHighlight.includes(pos.id)}
        pendingMove={!!tempPiece || !!tempBlock}
        handleClick={handleClick}
        spacing={spacing}
        positionSize={positionSize}
        pieceSize={pieceSize}
        activePiece={activePiece}
      >
        {pieces
          .filter(piece => piece.pos == pos.id)
          .filter(piece => isMobile ? true : piece.pos != activePiece?.pos)
          .filter(piece => !piecesToAnimate.map(p => p.newPositionId).includes(piece.pos))
          .map((piece, i) => <PieceMarker 
            key={i}
            piece={piece}
            pieceSize={pieceSize}
            handleClick={handlePieceClick}
          />)
        }
        {tempPiece && tempPiece.pos == pos.id && <PieceMarker 
            piece={tempPiece}
            pieceSize={pieceSize}
            pending={true}
        />}
      </Position>)}
      {isGameOver && <WinnerInfo info={isGameOver}/>}
    </div>
  )
}