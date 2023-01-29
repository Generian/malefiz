import styles from 'styles/WinnerInfo.module.css'
import Image from 'next/image'
import red_player from '../public/red_player.png'
import green_player from '../public/green_player.png'
import yellow_player from '../public/yellow_player.png'
import blue_player from '../public/blue_player.png'
import { Info } from "./Infos"
import { useEffect, useState } from 'react'

const imageMapping = {
  "RED": red_player,
  "GREEN": green_player,
  "YELLOW": yellow_player,
  "BLUE": blue_player
}

interface WinnerInfoProps {
  info: Info
}

export const WinnerInfo = ({ info }: WinnerInfoProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 0);
  }, [])

  return (
    <div className={`${styles.container} ${show ? styles.show : ''}`}>
      <div className={styles.sunContainer}>
        <div className={styles.sun}></div>
        <div className={`${styles.ray} ${styles.ray1}`}></div>
        <div className={`${styles.ray} ${styles.ray2}`}></div>
        <div className={`${styles.ray} ${styles.ray3}`}></div>
        <div className={`${styles.ray} ${styles.ray4}`}></div>
        <div className={`${styles.ray} ${styles.ray5}`}></div>
        <div className={`${styles.ray} ${styles.ray6}`}></div>
        <div className={`${styles.ray} ${styles.ray7}`}></div>
        <div className={`${styles.ray} ${styles.ray8}`}></div>
        <div className={`${styles.ray} ${styles.ray9}`}></div>
        <div className={`${styles.ray} ${styles.ray10}`}></div>
      </div>
      <div className={styles.background}>
        <div className={styles.imageContainer}>
          <p className={`font bold ${styles.title}`}>Winner!</p>
          <Image 
            src={imageMapping[info.player.color]} 
            alt={"Winner_image"} 
            // width={d.width * spacing}
            priority={true}
            className={styles.image}
          />
        </div>
        <div className={styles.winnerContainer}>
          <p className={`font bold ${info.player.color} ${styles.winner}`}>{info.player.username}</p>
        </div>
      </div>
    </div>
  )
}