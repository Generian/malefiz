import { PlayerColor } from "src/game/resources/playerColors";
import { PublicPlayer } from "src/pages";

export const onlyUnique = (value: any, index: any, self: string | any[]) => {
  return self.indexOf(value) === index;
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

export const getActivePlayer = (players: PublicPlayer[], activePlayerColor: PlayerColor) => {
  if (!players || !activePlayerColor) return
  console.log(players, activePlayerColor)
  return players?.find(p => p.color == activePlayerColor)
}
