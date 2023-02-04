import { useState, useEffect } from "react"

export const useAudio = () => {
  const [move, setMove] = useState<HTMLAudioElement | null>(null)
  const [dice, setDice] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    setMove(new Audio('/sounds/move.mp3'))
    setDice(new Audio('/sounds/dice.mp3'))
  }, [])

  const playSound = (sound: string) => {
    if (!move || !dice) return
    switch (sound) {
      case "move":
        console.log("play sound")
        move.currentTime = 0
        move.play()
        break

      case "dice":
        dice.play()
        break
    
      default:
        break
    }
  }

  return playSound
}