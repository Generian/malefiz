import styles from "../styles/Home.module.css"
import * as http from "http"
import { io, Socket } from "socket.io-client"
import { useContext, useEffect, useState } from "react"
import { getUuid, handleNewUuid, resolveUrlFromEnv } from "src/utils/helper"
import { PlayerColor } from "src/game/resources/playerColors"
import { useRouter } from "next/router"
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "src/utils/socketHelpers"
import { Game } from "./api/socket"
import PageFrame from "src/components/PageFrame"
import Image from "next/image"
import title_image from "../public/title_image.png"
import lobbyBackground_image from "../public/lobbyBackground.png"
import { GameState, GameType } from "src/game/resources/gameTypes"
import { getCopy } from "src/utils/translations"
import { LanguageContext } from "src/components/helper/LanguageContext"
import { LanguageSwitcher } from "src/components/helper/LanguageSwitcher"
import { Footer } from "src/components/helper/Footer"

// Keep Heroku app alive
setInterval(() => {
  http.get(resolveUrlFromEnv())
}, 25 * 60 * 1000)

export interface Player extends PublicPlayer {
  uuid: string
}

export interface PublicPlayer {
  username: string
  color: PlayerColor
  nextMoveTime?: EpochTimeStamp
  gameState?: GameState
  diceValue?: number
  online?: boolean
  isBot?: boolean
}

export interface Lobby {
  id: string
  gameType: GameType
  cooldown: number
  players: Player[]
}

export default function Home() {
  const router = useRouter()
  const { language, updateLanguage } = useContext(LanguageContext)

  return (
    <PageFrame withContext={false}>
      <div className={`${styles.container} background`}>
        <div className={styles.backgroundImage}>
          <Image
            src={lobbyBackground_image}
            alt='malefiz background image'
            layout='fill'
            objectFit='contain'
          />
        </div>
        <div className={styles.container_l1}>
          <div className={styles.titleImageContainer}>
            <div className={styles.titleImage}>
              <Image
                src={title_image}
                alt='Title'
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
          <div className={styles.container_l2}>
            <button
              className={`button primaryAlert large marginBottom`}
              onClick={() => router.push("/lobby")}
            >
              {getCopy("home.playButton", language)}
            </button>
            <div className={`${styles.description} secondary`}>
              <h2 className='font text_h2 center'>
                {getCopy("home.infoHeadline", language)}
              </h2>
              <p>{getCopy("home.infoTextParagraph1", language)}</p>

              <p>{getCopy("home.infoTextParagraph2", language)}</p>

              <p>{getCopy("home.infoTextParagraph3", language)}</p>

              <p>{getCopy("home.infoTextParagraph4", language)}</p>
            </div>
          </div>
        </div>
        <div className={styles.languageSwitcher}>
          <LanguageSwitcher />
        </div>
        <Footer />
      </div>
    </PageFrame>
  )
}
