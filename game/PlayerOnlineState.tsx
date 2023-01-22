import React from 'react'
import { PublicPlayer } from 'src/pages'
import styles from 'styles/PlayerOnlineState.module.css'

interface PlayerOnlineStateProps {
  players: PublicPlayer[]
}


export const PlayerOnlineState = ({ players }:PlayerOnlineStateProps) => {
  return (
    <div className={styles.container}>
      {players.map(p => <div key={p.username} className={`${styles.userContainer} ${p.online ? styles.online : ''}`}>
        <span className={`bold ${p.color}`}>{p.username}</span>
        {/* <div className={`${styles.onlineStatus} ${p.online ? styles.online : ''}`}></div> */}
      </div>)}
    </div>
  )
}