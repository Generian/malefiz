import * as React from "react"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import "/node_modules/flag-icons/css/flag-icons.min.css"
import { Button, IconButton, Menu, MenuItem } from "@mui/material"
import { acceptedLanguageType, acceptedLanguages } from "src/utils/translations"
import { LanguageContext } from "./LanguageContext"
import styles from "styles/LanguageSwitcher.module.css"

const LanguageMenuItem = ({
  language,
  isSelected,
  handleClose,
  updateLanguage,
}: {
  language: acceptedLanguageType
  isSelected: boolean
  handleClose: () => void
  updateLanguage: (newLanguage: acceptedLanguageType) => void
}) => {
  return (
    <MenuItem
      selected={isSelected}
      onClick={() => {
        updateLanguage(language)
        handleClose()
      }}
    >
      <span
        className={`fi fi-${language == "en" ? "gb" : language} ${
          styles.languageMenuItem
        }`}
      ></span>
    </MenuItem>
  )
}

export const LanguageSwitcher = () => {
  const { language, updateLanguage } = React.useContext(LanguageContext)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        size='small'
        onClick={handleClick}
      >
        <span
          className={`fi fi-${language == "en" ? "gb" : language} ${
            styles.languageButton
          }`}
        ></span>
      </IconButton>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {acceptedLanguages.map((l) => (
          <LanguageMenuItem
            key={`language_${l}`}
            language={l}
            isSelected={l == language}
            handleClose={handleClose}
            updateLanguage={updateLanguage}
          />
        ))}
      </Menu>
    </>
  )
}
