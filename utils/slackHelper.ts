import { resolveUrlFromEnv } from "./helper"

const FormData = require('form-data')

const sendSlackMessage = async (
  message: string
) => {
  const SLACK_API_KEY: string = process.env.SLACK_API_KEY as string
  if (!SLACK_API_KEY) {
    console.error("Slack API key not provided. Can't send update messages.")
    return
  }

  const myHeaders = new Headers()
  myHeaders.append("Authorization", `Bearer ${SLACK_API_KEY}`)

  const formdata = new FormData()
  formdata.append("channel", "C05MUM2M36W")
  formdata.append("blocks", message)

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  }

  fetch("https://slack.com/api/chat.postMessage", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result, requestOptions))
    .catch(error => console.log('error', error))
}

export const informSlackAbountLobbyCreation = (
  player: string | undefined,
  lobbyId: string
) => {
  const message = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `New lobby created by ${player || 'unknown'}.`
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Join Lobby"
        },
        "url": `${resolveUrlFromEnv()}lobby?lid=${lobbyId}`
      }
    }
  ]

  sendSlackMessage(JSON.stringify(message))
}

export const informSlackAboutGameStart = (
  players: string[],
  lobbyId: string
) => {
  const message = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Game started by players: ${players}.`
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Open Game"
        },
        "url": `${resolveUrlFromEnv()}play?lid=${lobbyId}`
      }
    }
  ]

  sendSlackMessage(JSON.stringify(message))
}