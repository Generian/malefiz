import React from 'react'
import Dice from 'react-dice-roll'
import styles from 'styles/Dice.module.css'

interface DiceProps {
  setDiceValue: (value: number, playerId?: number) => void,
}

export const DiceRoller = ({ setDiceValue }:DiceProps) => {
  return (
    <div className={styles.container}>
      <Dice
        onRoll={value => setDiceValue(value)}
        size={80}
        triggers={['click', 'Enter']}
      />
    </div>
  )
}