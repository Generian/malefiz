import { resolveUrlFromEnv } from "./helper"

const sendSlackMessage = async (
  message: string
) => {
  const SLACK_API_KEY: string = process.env.SLACK_API_KEY as string
  if (!SLACK_API_KEY) {
    console.error("Slack API key not provided. Can't send update messages.")
    return
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${SLACK_API_KEY}`,
      'content-Type': 'application/json'
    },
    body: JSON.stringify({
      'channel': 'C05MUM2M36W',
      'blocks': message
    }),
    redirect: 'follow'
  } as RequestInit

  fetch("https://slack.com/api/chat.postMessage", requestOptions)
    .then(response => response.text())
    .then(result => JSON.parse(result))
    .then (res => {
      if(res.ok !== true) {
        console.error(res)
      }
    })
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