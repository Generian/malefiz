import Image from 'next/image'
import gun from '../public/gun.png'
import gun_reverse from '../public/gun_reverse.png'
import tree from '../public/tree.png'
import house from '../public/house.png'
import finish from '../public/finish.png'
import red_player from '../public/red_player.png'
import green_player from '../public/green_player.png'
import yellow_player from '../public/yellow_player.png'
import blue_player from '../public/blue_player.png'
import { POSITION_SIZE, SPACING } from './resources/styles'
import { ConnectingLines } from './ConnectingLines'

export const Decoration = () => {
  return (
    <div 
      style={{ display: 'relative' }}
    >
      <ConnectingLines />
      <Image src={gun} alt={'gun'} width={70} style={{ position: 'absolute', top: SPACING/2, left: SPACING/1.7}}/>
      <Image src={gun_reverse} alt={'gun'} width={70} style={{ position: 'absolute', top: SPACING/2, left: 17 * SPACING + POSITION_SIZE - SPACING/1.7 - 70}}/>
      <Image src={finish} alt={'finish'} width={140} style={{ position: 'absolute', top: SPACING/8, left: (17 * SPACING + POSITION_SIZE)/2 - 70}}/>
      <Image src={tree} alt={'trees'} width={170} style={{ position: 'absolute', top: 5.2 * SPACING, left: 2 * SPACING}}/>
      <Image src={house} alt={'trees'} width={170} style={{ position: 'absolute', top: 5 * SPACING, left: 12.5 * SPACING}}/>
      <Image src={red_player} alt={'red_player'} width={SPACING * 9 / 5} style={{ position: 'absolute', top: 14.8 * SPACING, left: 2 * SPACING}}/>
      <Image src={green_player} alt={'green_player'} width={SPACING * 8.5 / 5} style={{ position: 'absolute', top: 15.2 * SPACING, left: 6.05 * SPACING}}/>
      <Image src={yellow_player} alt={'yellow_player'} width={SPACING * 6.5 / 5} style={{ position: 'absolute', top: 15.1 * SPACING, left: 10.28 * SPACING}}/>
      <Image src={blue_player} alt={'blue_player'} width={SPACING * 6.1 / 5} style={{ position: 'absolute', top: 15.2 * SPACING, left: 14.3 * SPACING}}/>
    </div>
  )
}