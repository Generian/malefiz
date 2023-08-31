import { useContext, useEffect, useState } from "react"
import { LanguageContext } from "src/components/helper/LanguageContext"
import { Player } from "src/pages"
import { acceptedLanguageType, getCopy } from "src/utils/translations"
import styles from "styles/Infos.module.css"

export type InfoType =
  | "ROLLED_DICE"
  | "KICKED_PLAYER"
  | "MOVED_BLOCK"
  | "TURN"
  | "GAMEOVER"

export interface Info {
  infoType: InfoType
  player: Player
  diceValue?: number
  kickedPlayer?: Player
}

interface InfosProps {
  infos: Info[]
}

const renderAction = (i: Info, language: acceptedLanguageType) => {
  switch (i.infoType) {
    case "ROLLED_DICE":
      return (
        <div className={styles.info}>
          <span className={`bold ${styles.username} ${i.player.color}`}>
            {i.player.username}
          </span>
          <span>{getCopy("game.infos.ROLLED_DICE", language)}</span>
          <span className={`bold`}>{i.diceValue}</span>
        </div>
      )

    case "KICKED_PLAYER":
      return (
        <div className={styles.info}>
          <span
            className={`bold ${styles.username} ${styles.short} ${i.player.color}`}
          >
            {i.player.username}
          </span>
          <span>{getCopy("game.infos.KICKED_PLAYER", language)}</span>
          <span
            className={`bold ${styles.username} ${styles.short} ${i.kickedPlayer?.color}`}
          >
            {i.kickedPlayer?.username}
          </span>
        </div>
      )

    case "MOVED_BLOCK":
      return (
        <div className={styles.info}>
          <span className={`bold ${styles.username} ${i.player.color}`}>
            {i.player.username}
          </span>
          <span>{getCopy("game.infos.MOVED_BLOCK", language)}</span>
          <span className={`bold`}>
            {getCopy("game.infos.MOVED_BLOCK_blocker", language)}
          </span>
        </div>
      )

    case "TURN":
      return (
        <div className={styles.info}>
          <span className={`bold ${styles.username} ${i.player.color}`}>
            {i.player.username}
          </span>
          <span>{getCopy("game.infos.TURN", language)}</span>
        </div>
      )

    case "GAMEOVER":
      return (
        <div className={styles.info}>
          <span className={`bold ${styles.username} ${i.player.color}`}>
            {i.player.username}
          </span>
          <span className={`bold`}>
            {getCopy("game.infos.GAMEOVER", language)}
          </span>
        </div>
      )

    default:
      return <span></span>
  }
}

export const Infos = ({ infos }: InfosProps) => {
  const { language } = useContext(LanguageContext)

  const [infosFiltered, setInfosFiltered] = useState([...infos] as Info[])

  useEffect(() => {
    const lastInfo = infos[infos.length - 1]
    const secondLastInfo = infos[infos.length - 2]
    const lastFilteredInfo = infosFiltered[infosFiltered.length - 1]
    if (
      lastInfo &&
      secondLastInfo &&
      lastFilteredInfo &&
      lastInfo.infoType == "TURN" &&
      secondLastInfo.infoType != lastFilteredInfo.infoType
    ) {
      setInfosFiltered([...infos.slice(0, infos.length - 1)])
      setTimeout(() => {
        setInfosFiltered([...infos])
      }, 500)
    } else {
      setInfosFiltered([...infos])
    }
  }, [infos])

  const infosToRender = [...infosFiltered, {}] as Info[]

  return (
    <div className={styles.container}>
      {infosToRender.map((i, index) => {
        if (!(index < infosFiltered.length - 4)) {
          if (i.infoType) {
            const phaseOut =
              infosFiltered.indexOf(i) == infosFiltered.length - 4 &&
              infosFiltered.length >= 4
            return (
              <div
                key={`info_${index}`}
                style={{
                  top: (infosFiltered.length - index) * 25,
                  opacity:
                    infosFiltered.length - index == 4
                      ? 0
                      : 1 - (infosFiltered.length - index) * 0.1,
                }}
                className={`${styles.infoContainer} ${
                  phaseOut ? styles.phaseOut : styles.phaseIn
                }`}
              >
                {renderAction(i, language)}
              </div>
            )
          } else {
            return (
              <div
                key={`info_${index}`}
                className={styles.infoContainer}
              ></div>
            )
          }
        }
      })}
    </div>
  )
}
