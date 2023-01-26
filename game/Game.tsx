import { useEffect, useState } from 'react'
import styles from 'styles/Game.module.css'
import { DiceRoller } from 'src/game/Dice'
import { Board } from './Board'
import { activeColors, nextPlayerColor, PlayerColor } from './resources/playerColors'
import { defaultBlocks, getResetPiecePosition, initialisePieces, positions, winningPosId } from './resources/positions'
import { getAvailableMovePaths } from './resources/routing'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from 'src/utils/socketHelpers'
import { GameState, GameType, Piece } from './resources/gameTypes'
import { getPlayer, updatePlayers, getUuid, handleNewUuid } from 'src/utils/helper'
import { useRouter } from 'next/router'
import { PublicPlayer } from 'src/pages'
import { Layout } from 'src/components/Layout'
import { Info, Infos } from './Infos'
import { PlayerOnlineState } from './PlayerOnlineState'
import { Action } from './resources/gameValidation'
import { Game } from 'src/pages/api/socket'

export const debugMode = false

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export const GameComp = () => {
  const router = useRouter()
  const { lid, r, g, y, b } = router.query

  // Generic states
  const [gameType, setGameType] = useState<GameType>('NORMAL')
  const [players, setPlayers] = useState<PublicPlayer[]>()
  const [pieces, setPieces] = useState<Piece[]>()
  const [blocks, setBlocks] = useState<number[]>(defaultBlocks)
  const [activePlayerColor, setActivePlayerColor] = useState<PlayerColor>() // FYI: This one is not required in competition mode, given that all players are active at the same time and their move right is only bound by the dice countdown.

  // Local-only data
  const [myColor, setMyColor] = useState<PlayerColor>()
  const [activePiece, setActivePiece] = useState<Piece>()

  // Auxiliary state
  const [isOnlineGame, setIsOnlineGame] = useState(!!lid)
  const [infos, setInfos] = useState<Info[]>([])

  // Normal mode
  // const [gameState, setGameState] = useState<GameState>('ROLL_DICE')
  // const [diceValue, setDiceValue] = useState<number | undefined>()

  const updateGameStateWithNewGameData = (newGame: Game) => {
    // Set game details
    setGameType(newGame.gameType)
    setPlayers(newGame.players)
    setPieces(newGame.pieces)
    setBlocks(newGame.blocks)
    setActivePlayerColor(newGame.activePlayerColor)
  }

  // Initialise local game
  useEffect(() => {
    if (!lid) {
      const colorsFromParams = activeColors(!!r, !!g, !!y, !!b)
      const colorsToInitialiseGame = colorsFromParams.length ? colorsFromParams : activeColors(true, true, true, true)
  
      setPlayers(colorsToInitialiseGame)
      setActivePlayerColor(colorsToInitialiseGame[0].color)
      setPieces(initialisePieces(colorsToInitialiseGame.map(c => c.color)))
    }
  }, [router.query])

  // Connect socket in case of a multiplayer game
  useEffect(() => {
    if (typeof lid == 'string') {
      socketInitializer()
      setIsOnlineGame(true)
    }
  }, [lid])

  useEffect(() => {
    if (gameType == 'NORMAL' && ['SELECT_PIECE', 'MOVE_BLOCK', 'END'].indexOf(gameState) > -1) {
      if (players && activePlayerColor) {
        const player = getPlayer(players, activePlayerColor)
        if (player) {
          setInfos([...infos, {
            player: player,
            state: gameState,
            diceValue: diceValue,
          }])
        }
      }
    }
  }, [gameState])

  useEffect(() => {
    if (gameType == 'COMPETITION') {
      if (players && activePlayerColor) {
        const player = getPlayer(players, activePlayerColor)
        if (player) {
          if (['SELECT_PIECE', 'MOVE_BLOCK', 'END'].indexOf(gameState) > -1) {
            setInfos([...infos, {
              player: player,
              state: gameState,
              diceValue: diceValue,
            }])
          }
        }
      }
    }
  }, [players])

  const socketInitializer = async () => {
    if (typeof lid != 'string') return

    console.log("Initialising socket")
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected', socket.id)

      socket.emit('requestUuid', lid, getUuid(), (newUuid, gameValidityData) => {
        handleNewUuid(newUuid)

        const { game, playerColor } = gameValidityData
        if (!game) {
          console.error("Game lobby ID is not valid. Redirecting back to Lobby.")
          router.push('/')
        } else if (!playerColor) {
          console.error("Player not in given game. Redirecting back to Lobby.")
          router.push('/')
        } else {
          // Set game details
          updateGameStateWithNewGameData(game)

          // Set player's color
          setMyColor(playerColor)
        }
      })
    })

    socket.on('receiveGameUpdate', (
      game
    ) => {
      console.log("receive game update", game, allPlayers)
      if (game.data && game.gameType) {
        const { gameType, data: { state, activePlayer, dice, blockers, playerPieces}} = game
        console.log("received game data", allPlayers)

        setGameType(gameType)
        setBlocks(blockers)
        setPieces(currentPieces => {
          const thrownPiece = currentPieces?.filter(c => c.color != playerPieces.filter(p => p.pos == c.pos)[0]?.color)[0]
          console.log("throwing:", thrownPiece, players)
          if (thrownPiece && players) {
            setInfos([...infos, {
              player: getPlayer(players, activePlayer) as PublicPlayer,
              state: 'KICK_PLAYER',
              kickedPlayer: getPlayer(players, thrownPiece.color) as PublicPlayer
            }])
          }
        return playerPieces
        })
        setPlayers(allPlayers)
        setActivePlayerColor(activePlayer)

        // Only necessary when not in COMPETITION mode
        setGameState(state)
        setDiceValue(dice)
      }
    })

    socket.on('playerUpdate', (
      lobbyId,
      players
    ) => {
      console.log("receive player data:", players, lobbyId)
      if (lobbyId == lid && players) {
        setPlayers(players)
      }
    })
  }

  // Multiplayer interaction
  const updateServerWithGameState = (
    action: Action
  ) => {
    if (typeof lid == 'string') {
      socket.emit('updateServerWithGameState', 
      lid, 
      getUuid(), 
      action)
    }
  }

  // Game interaction
  const myTurn = () => (myColor == activePlayerColor) || !lid || gameType == 'COMPETITION'

  const playerRolledDice = (
    diceValue: number,
  ) => {
    if (!myTurn()) return
    if (gameType == 'NORMAL') {
      if (gameState == 'ROLL_DICE') {
        setDiceValue(diceValue)
        setGameState('SELECT_PIECE')
        updateServerWithGameState('SELECT_PIECE', myColor ? myColor : activePlayerColor, diceValue)
      } else {
        console.warn("Rolled dice when not expected")
      }
    } else if (gameType == 'COMPETITION' && myColor && players) {
      const player = getPlayer(players, myColor)
      if (player?.gameState == 'ROLL_DICE') {
        const newPlayer: PublicPlayer = {
          ...player,
          gameState: 'SELECT_PIECE',
          diceValue: diceValue
        }
        const newPlayers = updatePlayers(players, newPlayer)
        setPlayers(newPlayers)
        updateServerWithGameState('SELECT_PIECE', myColor, diceValue, blocks, pieces, newPlayers)
      } else {
        console.warn("Rolled dice when not expected")
      }
    }
  }

  const playerSelectedPiece = (piece: Piece) => {
    if (!myTurn()) return
    if (gameType == 'NORMAL') {
      if (piece.color == activePlayerColor && (gameState == 'SELECT_PIECE' || gameState == 'MOVE_PIECE')) {
        setActivePiece(piece)
        setGameState('MOVE_PIECE')
      }
    } else if (gameType == 'COMPETITION' && myColor && players) {
      const player = getPlayer(players, myColor)
      if (player?.gameState == 'SELECT_PIECE' || player?.gameState == 'MOVE_PIECE') {
        setActivePiece(piece)
        const newPlayer: PublicPlayer = {
          ...player,
          gameState: 'MOVE_PIECE'
        }
        setPlayers(updatePlayers(players, newPlayer))
        console.log('test', newPlayer)
      }
    }
  }

  const getNewPiecePositions = (piece: Piece, newPiecePosition: number, pieces: Piece[]) => {
    const index = pieces.findIndex(p => p.pos == piece.pos && p.color == piece.color)
    const newPieces = [...pieces.slice(0, index), { ...piece, pos: newPiecePosition}, ...pieces.slice(index + 1)] as Piece[]
    return newPieces
  }

  const moveActivePiece = (posId: number) => {
    if (!activePlayerColor || !pieces || !players || !myColor || !myTurn()) return

    let diceValueInContext = diceValue
    let newPlayer = getPlayer(players, myColor)
    if (!newPlayer) {
      console.error("Could not find player!") 
      return
    }
    if (gameType == 'COMPETITION') {
      diceValueInContext = newPlayer?.diceValue
    }

    const moveOptions = !!diceValueInContext && !!activePiece && getAvailableMovePaths(activePiece.pos, myColor, diceValueInContext, blocks, pieces).map(p => p[p.length - 1])
    debugMode && console.log("Available paths:", moveOptions)

    if (!!moveOptions && moveOptions.includes(posId)) {
      let newPiecePositions = getNewPiecePositions(activePiece, posId, pieces)
      let newGameState: GameState = 'ROLL_DICE'
      let newDiceValue: number | undefined = diceValue
      if (gameType == 'COMPETITION') {
        newPlayer.gameState = 'ROLL_DICE'
        newPlayer.diceValue = diceValue
      }
      let newActivePlayerColor: PlayerColor = activePlayerColor
      let newBlocks: number[] = blocks

      const otherPlayerPieces = pieces.filter(p => p.color != (gameType == 'COMPETITION' ? myColor : activePlayerColor))
      

      if (blocks.includes(posId)) {
        newBlocks = blocks.filter(b => b != posId) //Remove block from current position
        newGameState = 'MOVE_BLOCK'
        if (gameType == 'COMPETITION') {
          newPlayer.gameState = 'MOVE_BLOCK'
        }
      } else if (otherPlayerPieces.map(p => p.pos).includes(posId)) {
        const pieceToReset = otherPlayerPieces.filter(o => o.pos == posId)[0]
        newPiecePositions = getNewPiecePositions(pieceToReset, getResetPiecePosition(pieceToReset, newPiecePositions), newPiecePositions)
      }
  
      if (diceValue != 6 && !blocks.includes(posId)) {
        newActivePlayerColor = nextPlayerColor(activePlayerColor, players.map(p => p.color))
        // newDiceValue = undefined
        if (gameType == 'COMPETITION') {
          // newPlayer.diceValue = undefined
        }
      }
      
      // Reset state
      setActivePiece(undefined)

      // Win condition
      if (posId == winningPosId) {
        newGameState = 'END'
      }

      // Update states
      setGameState(newGameState)
      setPieces(newPiecePositions)
      setActivePlayerColor(newActivePlayerColor)
      setDiceValue(newDiceValue)
      setBlocks(newBlocks)
      const newPlayers = updatePlayers(players, newPlayer)
      setPlayers(newPlayers)
      updateServerWithGameState(newGameState, newActivePlayerColor, newDiceValue, newBlocks, newPiecePositions, newPlayers)
    } else {
      console.warn("This is not a valid move option.")
    }
  }

  const moveBlock = (posId: number) => {
    if (!activePlayerColor || !pieces || !players || !myColor) return
    let newPlayer = getPlayer(players, myColor)
    if (!newPlayer) {
      console.error("Could not find player!") 
      return
    }
    const moveOptions = positions
      .filter(p => p.y > 1) // Filter out first rows
      .map(p => p.id)
      .filter(p => !blocks.includes(p)) // Filter for blocks
      .filter(p => !pieces.map(p => p.pos).includes(p)) // Filter out positions with players
    
    if (moveOptions.includes(posId)) {
      let newActivePlayerColor: PlayerColor = activePlayerColor
      if (diceValue != 6) {
        newActivePlayerColor = nextPlayerColor(activePlayerColor, players.map(p => p.color))
      }

      let newBlocks: number[] = [...blocks, posId]
      setBlocks(newBlocks)
      setGameState('ROLL_DICE')
      // setDiceValue(undefined)
      if (gameType == 'COMPETITION') {
        newPlayer.gameState = 'ROLL_DICE'
        // newPlayer.diceValue = undefined
      }
      setActivePlayerColor(newActivePlayerColor)
      const newPlayers = updatePlayers(players, newPlayer)
      setPlayers(newPlayers)

      updateServerWithGameState('ROLL_DICE', newActivePlayerColor, diceValue, newBlocks, pieces, newPlayers)
    } else {
      console.warn("Block can't be moved here!")
    }
  }

  const handleClick = (posId: number) => {
    if (!myTurn()) return
    let state: GameState | undefined = gameState
    if (gameType == 'COMPETITION' && players && myColor) {
      state = getPlayer(players, myColor)?.gameState
    }
    switch (state) {
      case 'MOVE_PIECE':
        moveActivePiece(posId)
        break

      case 'MOVE_BLOCK':
        moveBlock(posId)
        break
    
      default:
        console.warn("Unexpected click on board", state)
        break
    }

  }

  const getGameState = () => {
    if (gameType == 'NORMAL') {
      return gameState
    } else if (gameType == 'COMPETITION') {
      if (players && myColor) {
        const player = getPlayer(players, myColor)
        return player?.gameState
      } else {
        console.error('Could not get Competition game state')
      }
    }
  }

  return (
    <div className={styles.container}>
      {(activePlayerColor && pieces && players) && <>
        <Layout 
          board={        
            <Board 
              pieces={pieces}
              paths={!!diceValue && !!activePiece && !!getGameState() && getAvailableMovePaths(
                activePiece.pos,
                gameType == 'COMPETITION' ? myColor : activePlayerColor, 
                gameType == 'COMPETITION' ? getPlayer(players, myColor)?.diceValue : diceValue, 
                blocks, 
                pieces)}
              handleClick={handleClick}
              handlePieceClick={playerSelectedPiece}
              blocks={blocks}
            />
          }
          instructions={
            <div className={styles.infoContainer}>
              {<DiceRoller
                diceValue = {gameType == 'COMPETITION' ? getPlayer(players, myColor)?.diceValue : diceValue}
                setDiceValue={playerRolledDice}
                showDice={myTurn() && gameType == 'COMPETITION' ? getPlayer(players, myColor)?.gameState != 'MOVE_BLOCK' : gameState != 'MOVE_BLOCK' && activePlayerColor == myColor}
                enableDice={myTurn() && gameType == 'COMPETITION' ? getPlayer(players, myColor)?.gameState == 'ROLL_DICE' : gameState == 'ROLL_DICE'}
                activePlayerColor={gameType == 'COMPETITION' ? myColor ? myColor : activePlayerColor : activePlayerColor}
                nextMoveTime={myColor && getPlayer(players, myColor)?.nextMoveTime}
              />}
              <div className={styles.bottomInfoContainer}>
                {<Infos 
                  infos={infos}
                  setInfos={setInfos}
                />}
                {!!lid && <PlayerOnlineState players={players} />}
              </div>
              {debugMode && <button onClick={() => console.log("pieces:", pieces)}>Print pieces</button>}
              {debugMode && <button onClick={() => console.log("players:", players, myColor, activePiece, gameState)}>Print players</button>}
            </div>
          }
        />
      </>}
    </div>
  )
}