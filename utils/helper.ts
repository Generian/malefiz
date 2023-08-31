import { Piece } from "src/game/resources/gameTypes";
import { PlayerColor } from "src/game/resources/playerColors";
import { PublicPlayer } from "src/pages";

export const onlyUnique = (value: any, index: any, self: string | any[]) => {
  return self.indexOf(value) === index;
}

export const setCookie = (name: string, value: string, lifetimeInDays: number) => {
  document.cookie = `${name}=${value}; expires=${new Date(new Date().getTime()+60*60*1000*24*lifetimeInDays).toUTCString()}`
}

export const getCookie = (cname: string) => {
  if (typeof document == 'undefined') return null
  let name = cname + "="
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(';')
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
}

export const createLobbyId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let LobbyId = ''
  for (let i = 0; i < 5; i++) {
    const random = Math.floor(Math.random() * (chars.length))
    LobbyId += chars[random]
  }
  return LobbyId
}

export const getUuid = () => getCookie('uuid') as string

export const getPlayer = (players: PublicPlayer[], color: PlayerColor | undefined) => {
  if (!players || !color) return
  return players.filter(p => p.color == color)[0]
}

export const updatePlayers = (players: PublicPlayer[], newPlayer: PublicPlayer) => {
  let newPlayers = players
  const index = players.indexOf(players.filter(p => p.color == newPlayer.color)[0])
  newPlayers.splice(index, 1, newPlayer)
  return newPlayers
}

export const handleNewUuid = (newUuid: string) => {
  const uuid = getUuid()
  if (newUuid == uuid) {
    console.log("Expected case. No cookie update needed. Uuid:", uuid)
  } else if (!uuid) {
    console.log("No uuid set yet. Saving new uuid in cookie:", newUuid)
    setCookie('uuid', newUuid, 30)
  } else {
    console.error("Received a mismatching uuid. Unexpected error.")
  }
}

export const resolveUrlFromEnv = () => {
  const env = process.env.NODE_ENV
  if(env == "development"){
    return "http://localhost:3000/"
  } else if (env == "production"){
    return "https://malefiz-online.herokuapp.com/"
  } else {
    return "https://malefiz-online.herokuapp.com/"
  }
}
