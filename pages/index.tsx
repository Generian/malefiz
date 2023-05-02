import styles from '../styles/Home.module.css'
import { io, Socket } from "socket.io-client"
import { useEffect, useState } from 'react'
import { getUuid, handleNewUuid } from 'src/utils/helper'
import { PlayerColor } from 'src/game/resources/playerColors'
import { useRouter } from 'next/router';
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { Game } from './api/socket'
import PageFrame from 'src/components/PageFrame'
import { LobbyComp } from 'src/components/lobby/Lobby'
import Image from 'next/image'
import title_image from '../public/title_image.png'
import lobbyBackground_image from '../public/lobbyBackground.png'
import { GameState, GameType } from 'src/game/resources/gameTypes'

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
  gameType: GameType,
  cooldown: number,
  players: Player[]
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Home() {
  const router = useRouter()
  
  return (
    <PageFrame>
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
              <Image src={title_image} alt='Title' fill style={{ objectFit: "contain" }}/>
            </div>
          </div>
          <div className={styles.container_l2}>
            <button
              className={`button primaryAlert large marginBottom`}
              onClick={() => router.push('/lobby')} 
            >
              Play
            </button>
            <div className={`${styles.description} secondary`}>
              <h2 className='font text_h2 center'>About Malefiz</h2>
              <p>Malefiz is a popular German board game that was first published in 1960 by the German company Ravensburger. The game is also known as Barricade or Barricade-Ludo in some countries. Malefiz is a strategic game that involves players trying to move their pawns from the start position to the home position while trying to block their opponents' pawns.</p>

              <p>The gameplay of Malefiz involves a lot of strategy and tactical thinking as players must decide whether to advance their own pawns or block their opponents' pawns. The game is known for its simplicity, yet depth of strategy, making it popular among both children and adults.</p>

              <p>Malefiz was created by Werner Schöppner, a German game designer who was inspired by an earlier game called Pachisi. Pachisi is a traditional Indian board game that also involves moving pawns around a board while trying to block opponents' pawns. Schöppner adapted the basic gameplay of Pachisi to create Malefiz, adding a few new elements such as barricades to make the game more challenging and engaging.</p>

              <p>Since its release, Malefiz has become a classic board game in Germany and is enjoyed by players of all ages. The game has also been translated into several different languages and is popular in many other countries around the world.</p>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
