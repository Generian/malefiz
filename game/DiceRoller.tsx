import React, { useEffect, useState } from 'react'
import styles from 'styles/Dice.module.css'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import { PlayerColor } from './resources/playerColors'
import useSound from 'use-sound'
import { Dice } from './Dice'
import { GameState } from './resources/gameTypes'

interface DiceProps {
  diceValue: number | undefined
  activePlayerColor: PlayerColor | undefined
  gameState: GameState | undefined
  nextMoveTime?: EpochTimeStamp
  handleClick: () => void
}

const formatCountdown = (c: number) => {
  const seconds = Math.floor(c / 1000.0)
  const milliseconds = c - 1000 * seconds
  return `${seconds}:${Number(String(milliseconds).slice(0, 2)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`
}

export const DiceRoller = ({ 
  diceValue, 
  activePlayerColor,
  gameState,
  nextMoveTime,
  handleClick,
}: DiceProps) => {
  if (!nextMoveTime) {
    return <div className={styles.container}>
      <Dice 
        value={1}
        disabled={true}
        onClick={() => {}}
      />
    </div>
  }

  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timer | undefined = undefined
    if (nextMoveTime) {
      timer = setInterval(() => {
        const d = new Date(nextMoveTime)
        const newCountdown = nextMoveTime - new Date().getTime()
        if (newCountdown > 0) {
          setCountdown(newCountdown)
        } else {
          setCountdown(null)
          clearTimeout(timer)
        }
      }, 70)
    }

    return () => clearInterval(timer)
  }, [nextMoveTime])

  const showCountdown = nextMoveTime > new Date().getTime() && !!countdown

  const disableDice = showCountdown || gameState != 'ROLL_DICE'


  return (
    <div className={styles.container} style={{ pointerEvents: disableDice ? 'none' : 'all' }}>
      <Dice 
        value={diceValue}
        disabled={disableDice}
        onClick={handleClick}
      />
      {<div className={`${styles.diceHider} ${showCountdown ? styles.hide : ''}`}>
        <span className={`${styles.countdown} ${countdown && countdown < 2000 ? styles.imminent : ''}`}>{countdown && formatCountdown(countdown)}</span>
      </div>}
      {!disableDice && diceValue && <div className={`${styles.CTA} ${styles.bounce}`}>
        <ArrowUpwardRoundedIcon/>
        <span className={`${styles.CTA_text} ${activePlayerColor}`}>ROLL DICE!</span>
      </div>}
    </div>
  )
}