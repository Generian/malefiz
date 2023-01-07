import styles from 'styles/Board.module.css'
import { positions } from 'src/game/resources/positions'
import { Position } from './Position'
import { PieceMarker } from './PieceMarker'
import { POSITION_SIZE, SPACING } from './resources/styles'
import { Decoration } from './Decoration'
import { Piece } from './resources/gameTypes'
import { useWindowSize } from 'src/utils/windowSize'
import { getSquareSize } from 'src/components/Layout'


interface BoardProps {
  pieces: Piece[],
  paths: number[][] | false,
  handleClick: (posId: number) => void,
  handlePieceClick: (piece: Piece) => void,
  blocks: number[],
}

export const Board = ({ 
  pieces,
  paths,
  blocks,
  handleClick,
  handlePieceClick
}: BoardProps) => {
  const windowSize = useWindowSize()
  const boardSize = getSquareSize(windowSize) - 32
  const maxPosDimension = Math.max(...positions.map(p => p.x), ...positions.map(p => p.y))
  const spacing = boardSize / (maxPosDimension + 1)
  const positionSize = spacing * 0.8
  const pieceSize = positionSize * 0.85

  console.log(boardSize, maxPosDimension, spacing)
  
  const fieldsToHighlight = paths && paths.map(p => p[p.length - 1])
  return (
    <div
      className={`${styles.container} background`}
      style={{ minWidth: boardSize, minHeight: boardSize }}
      // style={{ minWidth: 17 * SPACING + POSITION_SIZE, minHeight: 17 * SPACING + POSITION_SIZE}}
    >
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
        {pieces.filter(piece => piece.pos == pos.id).map((piece, i) => <PieceMarker 
          key={i}
          piece={piece}
          pieceSize={pieceSize}
          handleClick={handlePieceClick}
        />)}
      </Position>)}
    </div>
  )
}