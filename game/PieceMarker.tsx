import styles from 'styles/PieceMarker.module.css'
import { Piece } from './resources/gameTypes'
import red_piece from 'src/public/red_piece_2.png'
import green_piece from 'src/public/green_piece_2.png'
import yellow_piece from 'src/public/yellow_piece_2.png'
import blue_piece from 'src/public/blue_piece_2.png'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import { Coord } from './Position'

const pieceMapping = {
  "RED": red_piece,
  "GREEN": green_piece,
  "YELLOW": yellow_piece,
  "BLUE": blue_piece
}

interface PieceMarker {
  piece: Piece
  pieceSize: number
  cursor?: {
    x: number
    y: number
  }
  coords?: Coord
  pending?: boolean
  handleClick?: (piece: Piece) => void
}

export const PieceMarker = ({ piece, pieceSize, cursor, coords, pending, handleClick }: PieceMarker) => {

  const clickHandler = handleClick ? () => handleClick(piece) : () => {}

  return (
    <div 
      className={`${styles.default}`} //${styles[piece.color]}
      style={{
        width: pieceSize, 
        height:pieceSize, 
        borderRadius: pieceSize/2,
        position: cursor ? 'fixed' : coords ? 'absolute' : 'relative', 
        left: cursor ? cursor.x - pieceSize/2 : coords ? coords.x - pieceSize/2 : '', 
        top: cursor ? cursor.y - pieceSize/2 : coords ? coords.y - pieceSize/2 : '', 
        pointerEvents: (cursor || coords) ? 'none' : 'all',
        zIndex: (cursor || coords) ? 4 : '',
        transition: coords ? 'top .2s ease-in, left .2s ease-in' : 'none'
      }}
      onClick={clickHandler}
      // onMouseDown={isMobile ? () => {} : clickHandler}
    >
      <Image 
        src={pieceMapping[piece.color]} 
        alt={`${piece.color} piece at ${piece.pos}`} 
        width={pieceSize*0.94}
        className={`${styles.piece} ${pending ? styles.pending : ''}`}
        style={{
          position: 'absolute',
          top: -pieceSize*0.7,
          zIndex: 3
        }}
      />
    </div>
  )
}