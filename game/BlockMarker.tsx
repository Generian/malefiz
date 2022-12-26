import styles from 'styles/BlockMarker.module.css'
import { PIECE_SIZE } from './resources/styles'

export const BlockMarker = () => {
  return (
    <div 
      className={styles.default}
      style={{ width: PIECE_SIZE, height:PIECE_SIZE, borderRadius: PIECE_SIZE/2 }}
    >
    </div>
  )
}