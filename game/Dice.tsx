import React from 'react'
import Dice from 'react-dice-roll'
import styles from 'styles/Dice.module.css'

interface DiceProps {
  diceValue: number | undefined,
  setDiceValue: (value: number, playerId?: number) => void,
  isActive: boolean
}

export const DiceRoller = ({ isActive, diceValue, setDiceValue }:DiceProps) => {

  // const rollDice = () => {
  //   // Generate a random number between 1 and 6
  //   const newValue = Math.floor(Math.random() * 6) + 1;
  //   setDiceValue(newValue);
  // }

  return (
    <div className={styles.container}>
      <Dice
        onRoll={value => setDiceValue(value)}
        disabled={!isActive}
        size={80}
      />
      {/* <div>{diceValue}</div>
      <button disabled={!isActive} onClick={rollDice}>Roll Dice</button> */}
    </div>
  )
}