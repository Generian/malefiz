import Image from 'next/image'
import gun from '../public/gun.png'
import gun_reverse from '../public/gun_reverse.png'
import tree from '../public/tree.png'
import house from '../public/house.png'
import finish from '../public/finish.png'
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
    </div>
  )
}