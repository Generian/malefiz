import styles from 'styles/Board.module.css'
import { positions } from 'src/game/resources/positions'
import { Position } from './Position'
import { PieceMarker } from './PieceMarker'
import { POSITION_SIZE, SPACING } from './resources/styles'
import { Decoration } from './Decoration'
import { Piece } from './resources/gameTypes'


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
  const fieldsToHighlight = paths && paths.map(p => p[p.length - 1])
  return (
    <div
      className={`${styles.container} background`}
      style={{ minWidth: 17 * SPACING + POSITION_SIZE, minHeight: 17 * SPACING + POSITION_SIZE}}
    >
      <Decoration />
      {positions.map(pos => <Position 
        key={pos.id}
        id={pos.id}
        blocked={blocks?.includes(pos.id)}
        highlightMovePosition={fieldsToHighlight && fieldsToHighlight.includes(pos.id)}
        handleClick={handleClick}
      >
        {pieces.filter(piece => piece.pos == pos.id).map((piece, i) => <PieceMarker key={i} piece={piece} handleClick={handlePieceClick} />)}
      </Position>)}
    </div>
  )
}