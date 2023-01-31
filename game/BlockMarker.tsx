import styles from 'styles/BlockMarker.module.css'

interface BlockMarkerProps {
  pieceSize: number
  cursor?: {
    x: number
    y: number
  }
  pending?: boolean
}

export const BlockMarker = ({ pieceSize, cursor, pending }: BlockMarkerProps) => {
  return (
    <div 
      className={`${styles.default} ${pending ? styles.pending : ''}`}
      style={{ 
        width: pieceSize, 
        height:pieceSize, 
        borderRadius: pieceSize/2, 
        position: cursor ? 'fixed' : 'relative', 
        left: cursor ? cursor.x - pieceSize/2 : '', 
        top: cursor ? cursor.y - pieceSize/2 : '', 
        pointerEvents: cursor ? 'none' : 'all',
        zIndex: cursor ? 2 : ''
      }}
    >
    </div>
  )
}