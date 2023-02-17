import { Piece } from "./gameTypes"
import { PlayerColor } from "./playerColors"
import { positions } from "./positions"

export const getAvailableMovePaths = (
  playerPos: number,
  playerColor: PlayerColor | undefined,
  steps: number | undefined,
  blocks: number[] = [],
  pieces: Piece[] = [],
) => {
  if (!steps || !playerColor) return []
  let remainingSteps = steps

  let paths:number[][] = []

  paths.push([playerPos])

  while (remainingSteps > 0) {
    const newPaths:number[][] = []
    for (let i = 0; i < paths.length; i++) { 
      const path = paths[i]
      const currentPlayerPos = path[path.length - 1]
      const nextPositions = positions.find(p => p.id == currentPlayerPos)?.connections
      nextPositions && nextPositions.forEach(n => {
        if (n != path[path.length - 2]) { //Check that player is not moving back and forth.
          if (!blocks.includes(n) || (blocks.includes(n) && remainingSteps == 1)) {
            const samePlayerPiecePositions = pieces.filter(p => p.color == playerColor && p.pos != playerPos).map(p => p.pos)
            if (remainingSteps != 1 || (remainingSteps == 1 && !samePlayerPiecePositions.includes(n))) {
              newPaths.push([...path, n])
            }
          }
        }
      })
    }
    paths = newPaths
    remainingSteps -= 1
  }

  return paths
}

export const getShortestPathsToFinish = () => {
  const finish = positions.filter(p => p.type == 'FINISH')[0]

  const shortestPaths: { [key: number]: number } = {}

  shortestPaths[finish.id] = -1

  let allPositionsCovered = false
  let steps = 1

  while (!allPositionsCovered) {
    getAvailableMovePaths(finish.id, 'RED', steps).forEach(p => {
      const finalPos = p[p.length - 1]
      if (!shortestPaths[finalPos]) {
        shortestPaths[finalPos] = steps
      }
    })

    // check if all positions are covered
    let positionsMissed = 0
    positions.filter(p => p.y >= 1 && p.y < finish.y).forEach(p => {
      if (!shortestPaths[p.id]) {
        positionsMissed += 1
      }
    })
    allPositionsCovered = positionsMissed == 0

    // Increment steps
    steps += 1
  }
  return shortestPaths
}