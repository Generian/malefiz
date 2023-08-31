import { useContext } from "react"
import styles from "styles/Footer.module.css"
import { LanguageContext } from "./LanguageContext"
import { getCopy } from "src/utils/translations"

export const Footer = () => {
  const { language } = useContext(LanguageContext)

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <a
          href='#'
          className='cky-banner-element'
        >
          Cookie Settings
        </a>
      </div>
    </div>
  )
}
