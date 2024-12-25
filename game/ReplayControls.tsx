import styles from "styles/ReplayControls.module.css"
import { IconButton } from "@mui/material"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"

interface ReplayControlsProps {
  replayActionIndex: number
  replayActionLength: number | undefined
  replayGameAction: () => void
}

export const ReplayControls = ({
  replayActionIndex,
  replayActionLength,
  replayGameAction,
}: ReplayControlsProps) => {
  console.log(replayActionIndex, replayActionLength)
  return (
    <div className={styles.container}>
      <IconButton
        disabled={replayActionIndex == 0}
        aria-label='KeyboardDoubleArrowLeft'
      >
        <KeyboardDoubleArrowLeftIcon />
      </IconButton>
      <IconButton
        disabled={replayActionIndex == 0}
        aria-label='KeyboardArrowLeft'
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton
        disabled={
          !replayActionLength || replayActionIndex == replayActionLength - 1
        }
        aria-label='KeyboardArrowRight'
        onClick={replayGameAction}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
      <IconButton
        disabled={
          !replayActionLength || replayActionIndex == replayActionLength - 1
        }
        aria-label='KeyboardDoubleArrowRight'
      >
        <KeyboardDoubleArrowRightIcon />
      </IconButton>
    </div>
  )
}
