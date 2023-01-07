import { ReactNode } from 'react'
import PageFrame from 'src/components/PageFrame'
import { MIN_BOARD_SIZE } from 'src/game/resources/styles'
import { useWindowSize, WindowSize } from 'src/utils/windowSize'
import styles from '../styles/Layout.module.css'

export const getSquareSize = ({width, height}: WindowSize) => {
  if (width && height) {
    const minDim = Math.min(width, height)
    const maxDim = Math.max(width, height)
    if (minDim < MIN_BOARD_SIZE) {
      return Math.max(minDim, maxDim * 0.67)
    } else {
      return minDim
    } 
  } else {
    return 0
  }
}

export const shouldUseLandscapeMode = ({width, height}: WindowSize) => {
  if (width && height) {
    if (width <= height) {
      const squareSize = getSquareSize({width, height})
      if (width < squareSize) {
        return true
      } else {
        return false
      }
    } else {
      return false // Already using landscape mode
    }
  } else {
    return false
  }
}

export const Layout = ({ board, instructions }: { board: ReactNode, instructions?: ReactNode }) => {
  const windowSize = useWindowSize()
  if ((typeof windowSize == 'undefined') || !windowSize.width || !windowSize.height) return <></>

  const instructionsPosition = {
    landScapeMode: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0
  }

  if (windowSize.width > windowSize.height) {
    instructionsPosition.landScapeMode = true
    instructionsPosition.left = getSquareSize(windowSize)
    instructionsPosition.width = windowSize.width - getSquareSize(windowSize)
    instructionsPosition.height = windowSize.height
  } else {
    instructionsPosition.top = getSquareSize(windowSize)
    instructionsPosition.width = windowSize.width
    instructionsPosition.height = windowSize.height - getSquareSize(windowSize)
  }

  return (
    <PageFrame landscapeMode={false}>
      <div className={styles.container} style={{ flexDirection: (windowSize.width > windowSize.height) ? 'row' : 'column'}}>
        <div 
          className={styles.square}
          style={{ width: getSquareSize(windowSize), height: getSquareSize(windowSize) }}
        >
          {board}
        </div>
        <div className={styles.fixedInstructionsContainer} style={{
          left: instructionsPosition.left,
          top: instructionsPosition.top,
          width: instructionsPosition.width,
          height: instructionsPosition.height
        }}>
          {instructions}
        </div>
      </div>
    </PageFrame>
  )
}
