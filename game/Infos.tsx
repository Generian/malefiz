import { Dispatch, SetStateAction } from 'react';
import { PublicPlayer } from 'src/pages';
import styles from 'styles/Infos.module.css'
import { GameState } from './resources/gameTypes'

export interface Info {
  player: PublicPlayer,
  state: GameState | 'KICK_PLAYER',
  diceValue?: number
  kickedPlayer?: PublicPlayer
}

interface InfosProps {
  infos: Info[], 
  setInfos: Dispatch<SetStateAction<Info[]>>
}

const renderAction = (i: Info) => {
  switch (i.state) {
    case 'SELECT_PIECE':
      return <>
      <span className={`bold ${i.player.color}`}>{i.player.username}</span>
      {` rolled `}
      <span className={`bold`}>{i?.diceValue}</span>
    </>

    case 'MOVE_BLOCK':
      return <>
      <span className={`bold ${i.player.color}`}>{i.player.username}</span>
      {` gets to move a `}
      <span className={`bold`}>blocker</span>
    </>

    case 'END':
      return <>{' won the game!'}</>
  
    default:
      return <span></span>
  }
}

export const Infos = ({ infos, setInfos }: InfosProps) => {
  const infosToRender = [...infos, {}] as Info[]

  return (
    <div className={styles.container}>
      {infosToRender.map((i, index) => {
        if (!(index < infos.length - 4)) {
          if (i.state) {
            const phaseOut = ((infos.indexOf(i) == infos.length - 4) && (infos.length >= 4))
            return <div 
            key={`info_${index}`}
            style={{ 
              top: (infos.length - index) * 25,
              opacity: 1 - (infos.length - index) * 0.25
            }}
            className={`${styles.infoContainer} ${phaseOut ? styles.phaseOut : styles.phaseIn}`}
            >
              {renderAction(i)}
            </div>
          } else {
            return <div 
              key={`info_${index}`}
              className={styles.infoContainer}
            ></div>
          }
        }
      })}
    </div>
  )
}