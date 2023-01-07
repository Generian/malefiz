import styles from 'styles/Position.module.css'
import { BlockMarker } from './BlockMarker'
import { debugMode } from './Game'
import { Pos, positions } from './resources/positions'
import { BORDER, POSITION_SIZE, REM, SPACING } from './resources/styles'

interface PositionProps {
  id: number,
  children?: any,
  highlightMovePosition: boolean,
  blocked: boolean
  handleClick: (posId: number) => void
  spacing: number
  positionSize: number
  pieceSize: number
}

export const getPosition = (x: number, y: number, spacing: number, positionSize: number, type: 'POSITION' | 'BORDER' | 'CENTER' = 'POSITION', height: number = 0) => {
  switch (type) {
    case 'POSITION':
      return {
        x: (x - 1) * spacing + spacing - positionSize/2 - 0.66*REM,
        y: 18 * spacing - (y + 4) * spacing + spacing/2
      }

    case 'BORDER':
      return {
        x: (x - 1) * spacing + spacing - BORDER - 0.66*REM, 
        y: 18 * spacing - (y + 4) * spacing + spacing/2 + positionSize/2 - (spacing * height) - BORDER
      }
  
    default:
      return {
        x: (x - 1) * spacing + spacing - positionSize/2 - 0.66*REM,
        y: 18 * spacing - (y + 4) * spacing + spacing/2
      }
  }
}

export const Position = ({ id, blocked, children, highlightMovePosition, handleClick, spacing, positionSize, pieceSize }: PositionProps) => {
  const position: Pos = positions.find(p => p.id == id) as Pos
  const coords = getPosition(position.x, position.y, spacing, positionSize)

  return (
    <div 
      style={{ 
        left: coords.x, 
        top: coords.y, 
        position: "absolute"
      }}
      onClick={() => handleClick(id)}
    >
      <div
        className={`${styles.default} ${highlightMovePosition ?styles.highlightMovePosition : ''} ${position.color ? styles[position.color] : ''} ${!!position.type ? styles[position.type] : ''}`}
        style={{ width: positionSize, height:positionSize, borderRadius: positionSize/2 }}
      >
        {children}
        {blocked && <BlockMarker pieceSize={pieceSize}/>}
        {debugMode && <div>
          <p>{position.id}</p>
          <p>{position.connections}</p>
        </div>}
      </div>
    </div>
  )
}