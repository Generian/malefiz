import { ReactNode } from 'react'
import PageFrame from 'src/components/PageFrame'
import { MIN_BOARD_SIZE, MAX_BOARD_SIZE, INFO_PANEL_WIDTH } from 'src/game/resources/styles'
import { useWindowSize, WindowSize } from 'src/utils/windowSize'
import styles from '../styles/Layout.module.css'

export const getSquareSize = ({width, height}: WindowSize) => {
  let boardSize = MAX_BOARD_SIZE
  let landscapeMode = true
  let overlayMode = false

  if (width && height) {
    const minDim = Math.min(width, height)

    if (width >= MIN_BOARD_SIZE + INFO_PANEL_WIDTH) {
      if (minDim < MAX_BOARD_SIZE) {
        boardSize = Math.min(height, width - INFO_PANEL_WIDTH)
      }
    } else {
      landscapeMode = false
      if (minDim < MAX_BOARD_SIZE) {
        boardSize = minDim
      }
      if (width > height - INFO_PANEL_WIDTH) {
        overlayMode = true
      }
    }
  }

  return { boardSize, landscapeMode, overlayMode }
}

export const shouldUseLandscapeMode = ({width, height}: WindowSize) => {
  if (width && height) {
    if (width <= height) {
      const {boardSize} = getSquareSize({width, height})
      if (width < boardSize) {
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

interface LayoutProps { 
  board: ReactNode, 
  instructions?: ReactNode,
  dice?: ReactNode
}

export const Layout = ({ board, instructions, dice }: LayoutProps) => {
  const windowSize = useWindowSize()
  if ((typeof windowSize == 'undefined') || !windowSize.width || !windowSize.height) return <></>

  const { boardSize, landscapeMode } = getSquareSize(windowSize)

  // const instructionsPosition = {
  //   landScapeMode: false,
  //   left: 0,
  //   top: 0,
  //   width: 0,
  //   height: 0
  // }

  // if (windowSize.width > windowSize.height) {
  //   instructionsPosition.landScapeMode = true
  //   instructionsPosition.left = getSquareSize(windowSize)
  //   instructionsPosition.width = windowSize.width - getSquareSize(windowSize)
  //   instructionsPosition.height = getSquareSize(windowSize)
  // } else {
  //   instructionsPosition.top = getSquareSize(windowSize)
  //   instructionsPosition.width = windowSize.width
  //   instructionsPosition.height = windowSize.height - getSquareSize(windowSize)
  // }

  return (
    <PageFrame noZoom={true}>
      <div className={styles.pageContainer}>
        <div 
          className={`${styles.container} ${landscapeMode ? styles.landscape : styles.portrait}`}
          style={{ 
            width: landscapeMode ? '100vw' : boardSize,
            height: landscapeMode ? boardSize : '100vh'
          }}
        >
          <div 
            className={styles.square}
            style={{ width: boardSize, height: boardSize }}
          >
            {board}
          </div>
          <div 
            className={styles.instructionsContainer}
            style={{
              width: landscapeMode ? INFO_PANEL_WIDTH : '100%',
              height: landscapeMode ? '100%' : ''
            }}
          >
            <div className={styles.dice}>
              {dice}
            </div>
            <div className={styles.instructions}>
              {landscapeMode && instructions}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  )

  // return (
  //   <PageFrame noZoom={true}>
  //     <div className={styles.container} style={{ flexDirection: (windowSize.width > windowSize.height) ? 'row' : 'column'}}>
  //       <div 
  //         className={styles.square}
  //         style={{ width: getSquareSize(windowSize), height: getSquareSize(windowSize) }}
  //       >
  //         {board}
  //       </div>
  //       <div className={`${styles.fixedInstructionsContainer} ${instructionsPosition.landScapeMode ? '' : styles.portrait}`} style={{
  //         left: instructionsPosition.left,
  //         top: instructionsPosition.top,
  //         width: 200,
  //         height: instructionsPosition.height
  //       }}>
  //         <div className={styles.dice}>
  //           {dice}
  //         </div>
  //         <div className={styles.instructions}>
  //           {instructionsPosition.landScapeMode && instructions}
  //         </div>
  //       </div>
  //     </div>
  //   </PageFrame>
  // )
}
