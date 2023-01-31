import { useEffect, useState } from 'react';
import styles from 'styles/Dice.module.css'

const sides = [1, 2, 3, 4, 5, 6]

const changeSide = (side: number) => {
  const s = sides.filter(s => s != side)
  return s[Math.floor(Math.random() * s.length)]
}

const Dot = ({ number, arr }: {number: number, arr: number[]}) => {
  return arr.includes(number) ? <div className={styles.dot}/> : <></>
}

const DiceSide = ({ number }: {number: number}) => {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridItem}><Dot number={number} arr={[4, 5, 6]}/></div>
      <div className={styles.gridItem}></div>
      <div className={styles.gridItem}><Dot number={number} arr={[2, 3, 4, 5, 6]}/></div>
      <div className={styles.gridItem}><Dot number={number} arr={[6]}/></div>
      <div className={styles.gridItem}><Dot number={number} arr={[1, 3, 5]}/></div>
      <div className={styles.gridItem}><Dot number={number} arr={[6]}/></div>
      <div className={styles.gridItem}><Dot number={number} arr={[2, 3, 4, 5, 6]}/></div>
      <div className={styles.gridItem}></div>
      <div className={styles.gridItem}><Dot number={number} arr={[4, 5, 6]}/></div>
    </div>
  )
}

interface DiceProps {
  value: number | undefined
  disabled: boolean
  onClick: () => void
}

export const Dice = ({ value, disabled, onClick }: DiceProps) => {
  const [side, setSide] = useState(value ? value : sides[0])

  useEffect(() => {
    let roller: NodeJS.Timer | undefined = undefined
    if (!value) {
      roller = setInterval(() => {
        setSide(side => changeSide(side))
      }, 200)
    } else {
      if (roller) {
        clearInterval(roller)
      }
      setSide(value)
    }
    return () => clearInterval(roller)
  }, [value])

  return (
  <div className={`${styles.cubeScene} ${disabled ? styles.disabled : ''}`} onClick={onClick}>
    <div className={`${styles.cube} ${styles[`show-${side}`]}`}>
      <div className={`${styles.cube__face} ${styles.cube__face__1}`}><DiceSide number={1}/></div>
      <div className={`${styles.cube__face} ${styles.cube__face__6}`}><DiceSide number={6}/></div>
      <div className={`${styles.cube__face} ${styles.cube__face__2}`}><DiceSide number={2}/></div>
      <div className={`${styles.cube__face} ${styles.cube__face__5}`}><DiceSide number={5}/></div>
      <div className={`${styles.cube__face} ${styles.cube__face__3}`}><DiceSide number={3}/></div>
      <div className={`${styles.cube__face} ${styles.cube__face__4}`}><DiceSide number={4}/></div>
    </div>
  </div>)
}