import { createContext, FC, ReactNode, useContext, useState } from "react"
import { setCookie } from "src/utils/helper"
import { acceptedLanguageType, acceptedLanguages } from "src/utils/translations"

interface LanguageContext {
  language: acceptedLanguageType
  updateLanguage: (newLanguage: acceptedLanguageType) => void
}

interface LanguageContextProviderProps {
  children: ReactNode
}

export const LanguageContext = createContext<LanguageContext>({
  language: acceptedLanguages[0],
  updateLanguage: (newLanguage: acceptedLanguageType) => {},
})

export const LanguageContextProvider: FC<LanguageContextProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<acceptedLanguageType>(acceptedLanguages[0])

  const updateLanguage = (newLanguage: acceptedLanguageType) => {
    setLanguage(newLanguage)
    setCookie('language', newLanguage, 365)
  }

  return (
    <LanguageContext.Provider value={{ language, updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

// export const useLanguageContext = () => {
//   const context = useContext(LanguageContext)
//   if (typeof context !== 'undefined') {
//     return context
//   } else {
//     return ({
//       language: acceptedLanguages[0],
//       updateLanguage: (newLanguage: acceptedLanguageType) => {
//         console.error("Not unpdating language correctly.", context)
//       }
//     })
//   }
// }