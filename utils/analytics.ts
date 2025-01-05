import ReactGA from "react-ga"

export const initGoogleAnalytics = () => {
  // Import measurement ID
  const NEXT_PUBLIC_GA_TRACKING_ID: string = process.env
    .NEXT_PUBLIC_GA_TRACKING_ID as string

  ReactGA.initialize(NEXT_PUBLIC_GA_TRACKING_ID)
}
