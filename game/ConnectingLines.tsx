import { positions } from "./resources/positions"
import styles from 'styles/ConnectingLines.module.css'
import { useEffect, useState } from "react"
import { getPosition } from "./Position"


const getConnectionDetails = (c: [number, number]) => {
  const start = positions.filter(p => p.id == c[0])[0]
  const end = positions.filter(p => p.id == c[1])[0]
  if (!end) {
    console.log(c)
  }
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(start.x - end.x),
    h: Math.abs(start.y - end.y),
  }
}

const getConnections = () => {
  return positions.map(p => p.connections.map(c => [p.id, c].sort((a, b) => a - b))).flat().filter((array, index, self) => {
  return self.findIndex((t) => t.join() === array.join()) === index;
}).map(c => getConnectionDetails(c as [number, number])).filter(c => c.y >= 0)
}

interface ConnectingLineProps {
  spacing: number
  positionSize: number
}

export const ConnectingLines = ({ spacing, positionSize }: ConnectingLineProps) => {
  const [connections, setConnections] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  }[]>([])

  useEffect(() => {
    setConnections(getConnections())
  }, [])

  return (
    <div 
      style={{ display: 'relative' }}
    >
      {connections && connections.map((c, i) => {
        const coords = getPosition(c.x, c.y, spacing, positionSize, 'BORDER', c.h)

        return <div 
          key={i} 
          className={styles.connection} 
          style={{ 
            left: coords.x, 
            top: coords.y, 
            width: c.w * spacing, 
            height: c.h * spacing
          }}
        ></div>})}
    </div>
  )
}