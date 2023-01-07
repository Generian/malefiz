import Image, { StaticImageData } from 'next/image'
import gun from '../public/gun.png'
import gun_reverse from '../public/gun_reverse.png'
import tree from '../public/tree.png'
import house from '../public/house.png'
import finish from '../public/finish.png'
import red_player from '../public/red_player.png'
import green_player from '../public/green_player.png'
import yellow_player from '../public/yellow_player.png'
import blue_player from '../public/blue_player.png'
import { ConnectingLines } from './ConnectingLines'
import { getPosition } from './Position'

interface DecorationProps {
  spacing: number
  positionSize: number
}

interface Decor {
  image: StaticImageData,
  alt: string
  x: number,
  y: number,
  width: number
  type: 'POSITION' | 'BORDER' | 'CENTER'
}

const decor: Decor[] = [
  {
    image: gun,
    alt: 'gun',
    x: 1,
    y: 14,
    width: 1.3,
    type: 'POSITION'
  },
  {
    image: gun_reverse,
    alt: 'gun',
    x: 16.3,
    y: 14,
    width: 1.3,
    type: 'POSITION'
  },
  {
    image: finish,
    alt: 'finish',
    x: 8.22,
    y: 14.2,
    width: 2.3,
    type: 'POSITION'
  },
  {
    image: tree,
    alt: 'tree',
    x: 2,
    y: 9,
    width: 3,
    type: 'POSITION'
  },
  {
    image: house,
    alt: 'house',
    x: 13,
    y: 9.5,
    width: 3,
    type: 'POSITION'
  },
  {
    image: red_player,
    alt: 'red_player',
    x: 2.45,
    y: -0.15,
    width: 1.95,
    type: 'POSITION'
  },
  {
    image: green_player,
    alt: 'green_player',
    x: 6.45,
    y: -0.5,
    width: 1.8,
    type: 'POSITION'
  },
  {
    image: yellow_player,
    alt: 'yellow_player',
    x: 10.7,
    y: -0.5,
    width: 1.4,
    type: 'POSITION'
  },
  {
    image: blue_player,
    alt: 'blue_player',
    x: 14.7,
    y: -0.5,
    width: 1.4,
    type: 'POSITION'
  }
]

export const Decoration = ({ spacing, positionSize }: DecorationProps) => {
  return (
    <div 
      style={{ display: 'relative' }}
    >
      <ConnectingLines 
        spacing={spacing}
        positionSize={positionSize}
      />
      {decor.map(d => {
        const coords = getPosition(d.x, d.y, spacing, positionSize, d.type)

        return <Image 
          src={d.image} 
          alt={d.alt} 
          width={d.width * spacing} 
          style={{ 
            position: 'absolute', 
            top: coords.y, 
            left: coords.x
          }}/>
      })}
    </div>
  )
}