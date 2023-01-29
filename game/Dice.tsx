import React, { useEffect, useState } from 'react'
import Dice from 'react-dice-roll'
import styles from 'styles/Dice.module.css'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import { PlayerColor } from './resources/playerColors'
import useSound from 'use-sound'
// import diceSound from 'src/public/dice.mp3'

interface DiceProps {
  diceValue: number | undefined
  setDiceValue: (value: number, playerId?: number) => void,
  enableDice: boolean
  showDice: boolean
  activePlayerColor: PlayerColor | undefined
  nextMoveTime?: EpochTimeStamp
}

type DiceValue = 2 | 1 | 3 | 4 | 5 | 6 | undefined

const formatCountdown = (c: number) => {
  const seconds = Math.floor(c / 1000.0)
  const milliseconds = c - 1000 * seconds
  return `${seconds}:${Number(String(milliseconds).slice(0, 2)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`
}

export const DiceRoller = ({ 
  diceValue, 
  setDiceValue, 
  enableDice, 
  showDice, 
  activePlayerColor,
  nextMoveTime 
}:DiceProps) => {
  const [countdown, setCountdown] = useState<number | null>(null)
  // const [play] = useSound(diceSound)

  useEffect(() => {
    if (nextMoveTime) {
      let timer = setInterval(() => {
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
  }, [nextMoveTime])

  const playerToRollDice = enableDice && showDice && nextMoveTime && (nextMoveTime <= new Date().getTime()) && !countdown

  if (nextMoveTime) {
    return <div className={styles.container}>
      <Dice
        onRoll={value => setDiceValue(value)}
        size={80}
        triggers={playerToRollDice ? ['click', 'Enter'] : []}
      />
      {<div className={`${styles.diceHider} ${(((nextMoveTime > new Date().getTime()) && countdown) || !showDice) ? styles.hide : ''}`}>
        <span className={`${styles.countdown} ${countdown && countdown < 2000 ? styles.imminent : ''}`}>{countdown && formatCountdown(countdown)}</span>
      </div>}
      {playerToRollDice && <div className={`${styles.CTA} ${styles.bounce}`}>
        <ArrowUpwardRoundedIcon/>
        <span className={`${styles.CTA_text} ${activePlayerColor}`}>ROLL DICE!</span>
      </div>}
    </div>
  } else if (showDice) {
    return <div className={styles.container} onClick={() => {
      }}>
      <Dice
        onRoll={value => {
          setDiceValue(value)
          // console.log("play sound!")
          // play()
        }}
        size={80}
        triggers={enableDice ? ['click', 'Enter'] : []}
      />
    </div>
  } else {
    return <>{diceValue}</>
  }
}