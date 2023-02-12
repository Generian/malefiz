import * as React from 'react'
import styles from 'styles/Menu.module.css'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { useState } from 'react';
import { Avatar, Dialog, DialogTitle, FormControlLabel, FormGroup, IconButton, ListItemAvatar, Switch } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { blue } from '@mui/material/colors';

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
            </FormGroup>
          </div>
        </div>
      </Dialog>
    </div>
  )
}