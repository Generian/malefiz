import * as React from "react"
import styles from "styles/Menu.module.css"
import { useContext, useState } from "react"
import {
  Dialog,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
} from "@mui/material"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import { LanguageContext } from "./helper/LanguageContext"
import { getCopy } from "src/utils/translations"

export const Menu = () => {
  const { language } = useContext(LanguageContext)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <IconButton
        aria-label='delete'
        onClick={() => setIsOpen(true)}
        size='large'
      >
        <SettingsOutlinedIcon fontSize='inherit' />
      </IconButton>
      <Dialog
        onClose={() => setIsOpen(false)}
        open={isOpen}
      >
        <div className={styles.container}>
          <span className={"text_h2"}>
            {getCopy("settings.title", language)}
          </span>
          <div className={styles.settingsContainer}>
            <span className={styles.subTitle}>
              {getCopy("settings.sounds", language)}
            </span>
            <FormGroup>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={getCopy("settings.dice", language)}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={getCopy("settings.pieces", language)}
              />
            </FormGroup>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
