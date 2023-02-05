import React from 'react'
import { Player } from 'src/pages'
import styles from 'styles/PlayerOnlineState.module.css'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import Man4OutlinedIcon from '@mui/icons-material/Man4Outlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'

interface PlayerOnlineStateProps {
  players: Player[]
}

export const PlayerOnlineState = ({ players }:PlayerOnlineStateProps) => {
  return (
    <div className={styles.container}>
      {players.map(p => <div 
        key={p.username} 
        className={`${styles.userContainer} ${p.online ? styles.online : ''}`}
      >
        <span className={`bold ${p.color} ${styles.username}`}>{p.username}</span>
        <div className={styles.gameState}>
          {p.gameState == 'ROLL_DICE' && <CasinoOutlinedIcon fontSize="small" />}
          {p.gameState == 'MOVE_PIECE' && <Man4OutlinedIcon fontSize="small" />}
          {p.gameState == 'MOVE_BLOCK' && <BlockOutlinedIcon fontSize="small" />}
          {p.gameState == 'END' && <EmojiEventsOutlinedIcon fontSize="small" />}
        </div>
      </div>
      )}
    </div>
  )
}