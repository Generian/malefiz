import React from 'react'
import Dice from 'react-dice-roll'
import styles from 'styles/Dice.module.css'

interface DiceProps {
  setDiceValue: (value: number, playerId?: number) => void,
  disabled: boolean
}

export const DiceRoller = ({ disabled, setDiceValue }:DiceProps) => {
  return (
    <div className={styles.container}>
      <Dice
        onRoll={value => setDiceValue(value)}
        disabled={disabled}
        size={80}
        triggers={['click', 'Enter']}
      />
    </div>
  )
}