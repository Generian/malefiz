import ReactGA from 'react-ga'

export const initGoogleAnalytics = () => {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_TRACKING_ID)
}