import * as React from 'react'
import styles from 'styles/Menu.module.css'
import { useState } from 'react'
import { Dialog, FormControlLabel, FormGroup, IconButton, Switch } from '@mui/material'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'

export const Menu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <IconButton aria-label="delete" onClick={() => setIsOpen(true)}  size="large">
        <SettingsOutlinedIcon fontSize="inherit" />
      </IconButton>
      <Dialog 
        onClose={() => setIsOpen(false)} 
        open={isOpen}
      >
        <div className={styles.container}>
          <span className={'text_h2'}>Settings</span>
          <div className={styles.settingsContainer}>
            <span className={styles.subTitle}>Sounds</span>
            <FormGroup >
              <FormControlLabel control={<Switch defaultChecked />} label="Dice" />
              <FormControlLabel control={<Switch defaultChecked/>} label="Pieces" />
              <a href="#" className="cky-banner-element">Cookie Settings</a>
            </FormGroup>
          </div>
        </div>
      </Dialog>
    </div>
  )
}