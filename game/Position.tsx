import styles from 'styles/Position.module.css'
import { BlockMarker } from './BlockMarker'
import { debugMode } from './Game'
import { Pos, positions } from './resources/positions'
import { POSITION_SIZE, SPACING } from './resources/styles'

interface PositionProps {
  id: number,
  children?: any,
  highlightMovePosition: boolean,
  blocked: boolean
  handleClick: (posId: number) => void
}

export const Position = ({ id, blocked, children, highlightMovePosition, handleClick }: PositionProps) => {
  const position: Pos = positions.find(p => p.id == id) as Pos
  const coords = {
    x: (position.x - 1) * SPACING + SPACING/2,
    y: 18 * SPACING - (position.y + 4) * SPACING + SPACING/2,
  }

  return (
    <div 
      style={{ left: coords.x, top: coords.y, position: "absolute"}}
      onClick={() => handleClick(id)}
    >
      <div
        className={`${styles.default} ${highlightMovePosition ?styles.highlightMovePosition : ''} ${position.color ? styles[position.color] : ''} ${!!position.type ? styles[position.type] : ''}`}
        style={{ width: POSITION_SIZE, height:POSITION_SIZE, borderRadius: POSITION_SIZE/2 }}
      >
        {children}
        {blocked && <BlockMarker />}
        {debugMode && <div>
          <p>{position.id}</p>
          <p>{position.connections}</p>
        </div>}
      </div>
    </div>
  )
}