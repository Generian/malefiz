import styles from 'styles/Position.module.css'
import { BlockMarker } from './BlockMarker'
import { debugMode } from './Game'
import { Pos, positions } from './resources/positions'
import { BORDER, REM } from './resources/styles'
import { isMobile } from 'react-device-detect'
import { Piece } from './resources/gameTypes'

interface PositionProps {
  id: number,
  children?: any,
  highlightMovePosition: boolean,
  blocked: boolean
  tempBlock: boolean
  pendingMove: boolean
  handleClick: (posId: number) => void
  spacing: number
  positionSize: number
  pieceSize: number
  activePiece?: Piece
}

export interface Coord {
  x: number
  y: number
}

export const getPosition = (
  x: number, 
  y: number, 
  spacing: number, 
  positionSize: number, 
  type: 'POSITION' | 'BORDER' | 'CENTER' = 'POSITION', 
  height: number = 0, 
) => {
  switch (type) {
    case 'POSITION':
      return {
        x: (x - 1) * spacing + spacing - positionSize/2 - 0.66*REM*(isMobile ? 0 : 1),
        y: 18 * spacing - (y + 4) * spacing + spacing/2
      }

    case 'BORDER':
      return {
        x: (x - 1) * spacing + spacing - BORDER - 0.66*REM*(isMobile ? 0 : 1), 
        y: 18 * spacing - (y + 4) * spacing + spacing/2 + positionSize/2 - (spacing * height) - BORDER
      }
    
    case 'CENTER':
      return {
        x: (x - 1) * spacing + spacing - 0.66*REM*(isMobile ? 0 : 1),
        y: 18 * spacing - (y + 4) * spacing + spacing - 0.3*REM
      }
  
    default:
      return {
        x: (x - 1) * spacing + spacing - positionSize/2 - 0.66*REM*(isMobile ? 0 : 1),
        y: 18 * spacing - (y + 4) * spacing + spacing/2
      }
  }
}

export const Position = ({ id, blocked, tempBlock, pendingMove, children, highlightMovePosition, handleClick, spacing, positionSize, pieceSize, activePiece }: PositionProps) => {
  const position: Pos = positions.find(p => p.id == id) as Pos
  const coords = getPosition(position.x, position.y, spacing, positionSize)

  console.log()

  return (
    <div 
      style={{ 
        left: coords.x, 
        top: coords.y, 
        position: "absolute"
      }}
      onClick={() => handleClick(id)}
      // onMouseUp={(isMobile && activePiece?.pos != id) ? () => {} : () => {
      //   console.log("Check:", activePiece?.pos, id, isMobile)
      //   handleClick(id)}}
    >
      <div
        className={`${styles.default} ${highlightMovePosition ?styles.highlightMovePosition : ''} ${position.color ? styles[position.color] : ''} ${!!position.type ? styles[position.type] : ''}`}
        style={{ 
          width: positionSize, 
          height:positionSize, 
          borderRadius: positionSize/2,
          borderWidth: isMobile ? '0.15rem' : '0.25rem',
          cursor: pendingMove ? 'default' : 'pointer'
        }}
      >
        {children}
        {blocked && <BlockMarker pieceSize={pieceSize}/>}
        {tempBlock && !blocked && <BlockMarker pieceSize={pieceSize} pending={true}/>}
        {debugMode && <div>
          <p>{position.id}</p>
          <p>{position.connections}</p>
        </div>}
      </div>
    </div>
  )
}