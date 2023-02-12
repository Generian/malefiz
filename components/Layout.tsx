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
      if (minDim < MAX_BOARD_SIZE + INFO_PANEL_WIDTH) {
        boardSize = Math.min(MAX_BOARD_SIZE, height, width - INFO_PANEL_WIDTH)
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
  menu?: ReactNode
}

export const Layout = ({ board, instructions, dice, menu }: LayoutProps) => {
  const windowSize = useWindowSize()
  if ((typeof windowSize == 'undefined') || !windowSize.width || !windowSize.height) return <></>

  const { boardSize, landscapeMode, overlayMode } = getSquareSize(windowSize)

  return (
    <PageFrame noZoom={true}>
      <div 
        className={styles.pageContainer}
        style={{
          alignItems: overlayMode ? 'flex-start' : 'center'
        }}
      >
        <div 
          className={`${styles.container} ${landscapeMode ? styles.landscape : styles.portrait}`}
          style={{ 
            width: landscapeMode ? '100vw' : boardSize,
            height: landscapeMode ? boardSize : '100vh',
          }}
        >
          <div 
            className={styles.square}
            style={{ minWidth: boardSize, minHeight: boardSize }}
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
            <div className={`${styles.dice} ${overlayMode ? styles.dice_overlay : styles.dice_normal}`}>
              {dice}
            </div>
            {!overlayMode && <div 
              className={styles.instructions}
              style={{}}
            >
              {instructions}
            </div>}
          </div>
          <div className={styles.menu}>
            {menu}
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
