import styles from "styles/Home.module.css"
import { useContext, useEffect } from "react"
import { getUuid } from "src/utils/helper"
import { PlayerColor } from "src/game/resources/playerColors"
import { useRouter } from "next/router"
import { LobbyCard, LobbyComp } from "src/components/lobby/Lobby"
import Image from "next/image"
import title_image from "public/title_image.png"
import lobbyBackground_image from "public/lobbyBackground.png"
import { GameState, GameType } from "src/game/resources/gameTypes"
import { getCopy } from "src/utils/translations"
import { LanguageContext } from "src/components/helper/LanguageContext"
import { LanguageSwitcher } from "src/components/helper/LanguageSwitcher"
import { Footer } from "src/components/helper/Footer"
import { useSocket } from "src/context/SocketContext"
import { useData } from "src/context/DataContext"

export interface Player extends PublicPlayer {
  uuid: string
}

export interface PublicPlayer {
  username: string
  color: PlayerColor
  nextMoveTime?: EpochTimeStamp
  gameState?: GameState
  diceValue?: number
  online?: boolean
  isBot?: boolean
}

export interface Lobby {
  id: string
  gameType: GameType
  cooldown: number
  players: Player[]
}

export default function Lobbies() {
  const router = useRouter()
  const { socket } = useSocket()
  const { lobbies, getLobby } = useData()

  const { language } = useContext(LanguageContext)
  const { lid } = router.query

  useEffect(() => {
    if (!lid) {
      socket && leaveLobby()
      return
    }

    const lobby = getLobby(lid as string)

    if (!lobby) {
      router.push("/lobby")
    } else {
      joinLobby(lobby.id)
    }
  }, [lid])

  const createLobby = () => {
    if (!socket) {
      console.log("No socket available.")
    }
    socket?.emit("createLobby", getUuid(), (lid: string) => {
      router.push(`/lobby?lid=${lid}`)
    })
  }

  const updateLobbySettings = (
    lobbyId: string,
    gameType: GameType,
    cooldown: number
  ) => {
    socket?.emit("changeLobbySettings", getUuid(), lobbyId, gameType, cooldown)
  }

  const joinLobby = (
    lobbyId: string,
    color: PlayerColor | undefined = undefined
  ) => {
    const lobby = getLobby(lobbyId)
    if (!isPlayerInALobby() && lobby && lobby?.players?.length < 4) {
      socket?.emit("joinLobby", lobbyId, color, getUuid())
    }
  }

  const addBot = (lobbyId: string, color: PlayerColor) => {
    const lobby = getLobby(lobbyId)
    if (lobby?.players.filter((p) => p.uuid == getUuid())[0]) {
      socket?.emit("addBotToLobby", lobbyId, color, getUuid())
    }
  }

  const removeBot = (lobbyId: string, color: PlayerColor) => {
    const lobby = getLobby(lobbyId)
    if (lobby?.players.filter((p) => p.uuid == getUuid())[0]) {
      socket?.emit("removeBotFromLobby", lobbyId, color, getUuid())
    }
  }

  const leaveLobby = (lobbyId: string = "") => {
    socket?.emit("leaveLobby", lobbyId, getUuid())
    router.push("/lobby")
  }

  const handleUsernameChange = (lobbyId: string, newUsername: string) => {
    socket?.emit("updateUsername", newUsername, getUuid(), lobbyId)
  }

  const handleChangePlayerColor = (lobbyId: string, color?: PlayerColor) => {
    socket?.emit("changePlayerColor", lobbyId, color, getUuid())
  }

  const isPlayerInALobby = (lobbyId?: string) => {
    let filteredLobbies = lobbies
    if (lobbyId) {
      filteredLobbies = filteredLobbies.filter((l) => l.id == lobbyId)
    }
    const allPlayers = filteredLobbies
      .map((l) => l.players)
      .map((p) => p.map((p) => p.uuid))
      .flat()
    return allPlayers.includes(getUuid())
  }

  const startSingleplayerGame = () => {
    lobbies
      .filter((l) => l.players.map((p) => p.uuid).includes(getUuid()))
      .forEach((l) => leaveLobby(l.id))
    router.push("/play")
  }

  const startMultiplayerGame = (lobbyId: string) => {
    socket?.emit("startGame", lobbyId, getUuid())
  }

  return (
    <div className={`${styles.container} background`}>
      <div className={styles.backgroundImage}>
        <Image
          src={lobbyBackground_image}
          alt='malefiz background image'
          fill
          priority
        />
      </div>
      <div className={styles.container_l1}>
        <div className={styles.titleImageContainer}>
          <div
            className={styles.titleImage}
            onClick={() => router.push("/")}
          >
            <Image
              src={title_image}
              alt='Title'
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
        <div className={styles.container_l2}>
          {!lid && (
            <button
              className={`button primaryAlert large marginBottom`}
              onClick={startSingleplayerGame}
            >
              {getCopy("lobby.quickGameButton", language)}
            </button>
          )}

          {!lid && lobbies.length > 0 && (
            <h2 className={`text_h2 ${styles.outline}`}>
              {getCopy("lobby.lobbyTitle", language)}
            </h2>
          )}

          {lobbies.length == 0 && (
            <div className={styles.containerEmptyState}>
              <button
                className={`button secondary large marginBottom`}
                onClick={createLobby}
              >
                {getCopy("lobby.createLobbyButton", language)}
              </button>
            </div>
          )}

          <div className={styles.container_l3}>
            <div className={styles.container_l4}>
              {lobbies
                .filter((l) => l.id == lid)
                .map((l) => (
                  <LobbyComp
                    key={l.id}
                    lobby={l}
                    handleChangePlayerColor={handleChangePlayerColor}
                    handleUsernameChange={handleUsernameChange}
                    joinLobby={joinLobby}
                    addBot={addBot}
                    removeBot={removeBot}
                    leaveLobby={leaveLobby}
                    startMultiplayerGame={startMultiplayerGame}
                    isPlayerInALobby={isPlayerInALobby}
                    updateLobbySettings={updateLobbySettings}
                  />
                ))}
              {!lid &&
                lobbies.map((l) => (
                  <LobbyCard
                    key={`lobby_${l.id}`}
                    lobby={l}
                    handleClick={() => router.push(`/lobby?lid=${l.id}`)}
                  />
                ))}
            </div>
            {!lid && !isPlayerInALobby() && lobbies.length > 0 && (
              <div className={styles.bottomContainer}>
                <button
                  className={`button secondary marginBottom`}
                  onClick={createLobby}
                >
                  {getCopy("lobby.createLobbyButton", language)}
                </button>
              </div>
            )}
          </div>
          {/* <Paper>
              <div className={styles.container_l3}>
                <Typography variant="h4">
                  Games
                </Typography>
                {games?.map((g, i) => <div key={g.lobbyId}>
                  <span onClick={() => router.push(`/play?lid=${g.lobbyId}`)}>Game {i + 1}</span>
                </div>)}
              </div>
            </Paper> */}
        </div>
      </div>
      <div className={styles.languageSwitcher}>
        <LanguageSwitcher />
      </div>
      <Footer />
    </div>
  )
}
