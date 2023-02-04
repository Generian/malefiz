import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { PieceMarker } from "./PieceMarker"
import { Coord, getPosition } from "./Position"
import { Piece } from "./resources/gameTypes"
import { UPDATE_MOVE_PIECE } from "./resources/gameValidation"
import { getPositionFromId } from "./resources/positions"

interface AnimatedPieceProps {
  piece: Piece
  startCoords: Coord
  path: Coord[]
  pieceSize: number
  setPiecesToAnimate: Dispatch<SetStateAction<UPDATE_MOVE_PIECE[]>>
}

interface PieceMoveAnimationProps {
  piecesToAnimate: UPDATE_MOVE_PIECE[] 
  setPiecesToAnimate: Dispatch<SetStateAction<UPDATE_MOVE_PIECE[]>>
  spacing: number
  positionSize: number
  pieceSize: number
}

const AnimatedPiece = ({ piece, startCoords, path, pieceSize, setPiecesToAnimate }: AnimatedPieceProps) => {
  const [coords, setCoords] = useState<Coord>(startCoords)

  // Update coordinates
  useEffect(() => {
    let index = 0
    const audio = new Audio('/sounds/move.mp3')
    let timer: NodeJS.Timer | undefined = undefined
    timer = setInterval(() => {
      if (index < path.length - 1) {
        setCoords(path[index + 1])
        if (index) {
          audio.volume = 0.3
          audio.currentTime = 0
          audio.play()
          // playSound('move')
          console.log("animate: play sound")
        }
        index += 1
      } else {
        audio.currentTime = 0
        audio.play()
        clearInterval(timer)
        console.log("animate: play sound final")

        setPiecesToAnimate(p => p.filter(p => p.activePiece.pos != piece.pos && p.activePiece.color != piece.color))
      }
    }, 200)
    return () => clearInterval(timer)
  }, [])

  return <PieceMarker 
    piece={piece}
    pieceSize={pieceSize}
    coords={coords}
  />
}

export const PieceMoveAnimation = ({ 
  piecesToAnimate,
  setPiecesToAnimate, 
  spacing, 
  positionSize,
  pieceSize
}: PieceMoveAnimationProps) => {
  return (
    <>
      {piecesToAnimate.map(p => {
        if (!p.path) return
        const startPos = getPositionFromId(p.activePiece.pos)

        const startCoords = getPosition(startPos.x, startPos.y, spacing, positionSize, 'CENTER')

        const path = p.path?.map(p => {
          const pos = getPositionFromId(p)
          return getPosition(pos.x, pos.y, spacing, positionSize, 'CENTER')
        })
        
        return <AnimatedPiece
          key={JSON.stringify(p)}
          piece={p.activePiece}
          startCoords={startCoords}
          path={path}
          pieceSize={pieceSize}
          setPiecesToAnimate={setPiecesToAnimate}
        />
      }
      )}
    </>
  )
}