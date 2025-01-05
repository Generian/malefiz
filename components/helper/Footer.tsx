import { useContext } from "react"
import styles from "styles/Footer.module.css"
import { LanguageContext } from "./LanguageContext"
import { getCopy } from "src/utils/translations"
import StarsIcon from "@mui/icons-material/Stars"

export const Footer = () => {
  const { language } = useContext(LanguageContext)

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <a
          href='#'
          className='cky-banner-element'
        >
          {getCopy("footer.privacySettings", language)}
        </a>
      </div>
      <div
        className={`${styles.buttonContainer} ${styles.buttonContainerHighlighted}`}
      >
        <a
          href='https://github.com/Generian/malefiz/discussions'
          className='cky-banner-element'
          target='_blank'
          rel='noopener noreferrer'
        >
          {getCopy("footer.forumButtonLabel", language)}
        </a>
        <div className={styles.newIcon}>
          <StarsIcon style={{ color: "white" }} />
        </div>
      </div>
    </div>
  )
}
