import { Piece } from "../Game"
import { PlayerColor } from "./playerColors"

export interface Pos {
  id: number,
  x: number,
  y: number,
  connections: number[],
  type?: 'BLOCK_MARKER' | 'FINISH',
  color?: PlayerColor,
}

export const RedPlayerPositions: number[] = [1000, 1001, 1002, 1003, 1004]
export const GreenPlayerPositions: number[] = [1005, 1006, 1007, 1008, 1009]
export const YellowPlayerPositions: number[] = [1010, 1011, 1012, 1013, 1014]
export const BluePlayerPositions: number[] = [1015, 1016, 1017, 1018, 1019]

export const initialisePieces = () => {
  const players: Piece[] = []
  RedPlayerPositions.forEach(p => players.push({ pos: p, color: 'RED'}))
  GreenPlayerPositions.forEach(p => players.push({ pos: p, color: 'GREEN'}))
  YellowPlayerPositions.forEach(p => players.push({ pos: p, color: 'YELLOW'}))
  BluePlayerPositions.forEach(p => players.push({ pos: p, color: 'BLUE'}))

  return players
}

export const getResetPiecePosition = (piece: Piece, pieces: Piece[]) => {
  const allStartingPositionIds = positions.filter(p => p.color == piece.color).map(p => p.id)
  const freeStartingPositionIds = allStartingPositionIds.filter(p => !pieces.map(p => p.pos).includes(p))
  return freeStartingPositionIds[0]
}

export const positions: Pos[] = [
  {
    id: 1,
    x: 1,
    y: 1,
    connections: [2, 18]
  },
  {
    id: 2,
    x: 2,
    y: 1,
    connections: [1, 3]
  },
  {
    id: 3,
    x: 3,
    y: 1,
    connections: [2, 4]
  },
  {
    id: 4,
    x: 4,
    y: 1,
    connections: [3, 5]
  },
  {
    id: 5,
    x: 5,
    y: 1,
    connections: [4, 6, 19]
  },
  {
    id: 6,
    x: 6,
    y: 1,
    connections: [5, 7]
  },
  {
    id: 7,
    x: 7,
    y: 1,
    connections: [6, 8]
  },
  {
    id: 8,
    x: 8,
    y: 1,
    connections: [7, 9]
  },
  {
    id: 9,
    x: 9,
    y: 1,
    connections: [8, 10, 20]
  },
  {
    id: 10,
    x: 10,
    y: 1,
    connections: [9, 11]
  },
  {
    id: 11,
    x: 11,
    y: 1,
    connections: [10, 12]
  },
  {
    id: 12,
    x: 12,
    y: 1,
    connections: [11, 13]
  },
  {
    id: 13,
    x: 13,
    y: 1,
    connections: [12, 14, 21]
  },
  {
    id: 14,
    x: 14,
    y: 1,
    connections: [13, 15]
  },
  {
    id: 15,
    x: 15,
    y: 1,
    connections: [14, 16]
  },
  {
    id: 16,
    x: 16,
    y: 1,
    connections: [15, 17]
  },
  {
    id: 17,
    x: 17,
    y: 1,
    connections: [16, 22]
  },
  {
    id: 18,
    x: 1,
    y: 2,
    connections: [1, 23]
  },
  {
    id: 19,
    x: 5,
    y: 2,
    connections: [5, 27]
  },
  {
    id: 20,
    x: 9,
    y: 2,
    connections: [9, 31]
  },
  {
    id: 21,
    x: 13,
    y: 2,
    connections: [13, 35]
  },
  {
    id: 22,
    x: 17,
    y: 2,
    connections: [17, 39]
  },
  {
    id: 23,
    x: 1,
    y: 3,
    connections: [18, 24],
    type: 'BLOCK_MARKER'
  },
  {
    id: 24,
    x: 2,
    y: 3,
    connections: [23, 25]
  },
  {
    id: 25,
    x: 3,
    y: 3,
    connections: [24, 26, 40]
  },
  {
    id: 26,
    x: 4,
    y: 3,
    connections: [25, 27]
  },
  {
    id: 27,
    x: 5,
    y: 3,
    connections: [19, 26, 28],
    type: 'BLOCK_MARKER'
  },
  {
    id: 28,
    x: 6,
    y: 3,
    connections: [27, 29]
  },
  {
    id: 29,
    x: 7,
    y: 3,
    connections: [28, 30, 41]
  },
  {
    id: 30,
    x: 8,
    y: 3,
    connections: [29, 31]
  },
  {
    id: 31,
    x: 9,
    y: 3,
    connections: [20, 30, 32],
    type: 'BLOCK_MARKER'
  },
  {
    id: 32,
    x: 10,
    y: 3,
    connections: [31, 33]
  },
  {
    id: 33,
    x: 11,
    y: 3,
    connections: [32, 34, 42]
  },
  {
    id: 34,
    x: 12,
    y: 3,
    connections: [33, 35]
  },
  {
    id: 35,
    x: 13,
    y: 3,
    connections: [21, 34, 36],
    type: 'BLOCK_MARKER'
  },
  {
    id: 36,
    x: 14,
    y: 3,
    connections: [35, 37]
  },
  {
    id: 37,
    x: 15,
    y: 3,
    connections: [36, 38, 43]
  },
  {
    id: 38,
    x: 16,
    y: 3,
    connections: [37, 39]
  },
  {
    id: 39,
    x: 17,
    y: 3,
    connections: [38, 22],
    type: 'BLOCK_MARKER'
  },
  {
    id: 40,
    x: 3,
    y: 4,
    connections: [25, 44]
  },
  {
    id: 41,
    x: 7,
    y: 4,
    connections: [29, 49]
  },
  {
    id: 42,
    x: 11,
    y: 4,
    connections: [33, 54]
  },
  {
    id: 43,
    x: 15,
    y: 4,
    connections: [37, 58]
  },
  {
    id: 44,
    x: 3,
    y: 5,
    connections: [40, 45]
  },
  {
    id: 45,
    x: 4,
    y: 5,
    connections: [44, 47]
  },
  {
    id: 47,
    x: 5,
    y: 5,
    connections: [45, 48, 59]
  },
  {
    id: 48,
    x: 6,
    y: 5,
    connections: [47, 49]
  },
  {
    id: 49,
    x: 7,
    y: 5,
    connections: [41, 48, 50]
  },
  {
    id: 50,
    x: 8,
    y: 5,
    connections: [49, 51]
  },
  {
    id: 51,
    x: 9,
    y: 5,
    connections: [50, 52]
  },
  {
    id: 52,
    x: 9,
    y: 5,
    connections: [51, 53]
  },
  {
    id: 53,
    x: 10,
    y: 5,
    connections: [52, 54]
  },
  {
    id: 54,
    x: 11,
    y: 5,
    connections: [42, 53, 55]
  },
  {
    id: 55,
    x: 12,
    y: 5,
    connections: [54, 56]
  },
  {
    id: 56,
    x: 13,
    y: 5,
    connections: [55, 57, 60]
  },
  {
    id: 57,
    x: 14,
    y: 5,
    connections: [56, 58]
  },
  {
    id: 58,
    x: 15,
    y: 5,
    connections: [57, 43]
  },
  {
    id: 59,
    x: 5,
    y: 6,
    connections: [47, 61]
  },
  {
    id: 60,
    x: 13,
    y: 6,
    connections: [56, 69]
  },
  {
    id: 61,
    x: 5,
    y: 7,
    connections: [59, 62]
  },
  {
    id: 62,
    x: 6,
    y: 7,
    connections: [61, 63]
  },
  {
    id: 63,
    x: 7,
    y: 7,
    connections: [62, 64, 70],
    type: 'BLOCK_MARKER'
  },
  {
    id: 64,
    x: 8,
    y: 7,
    connections: [63, 65]
  },
  {
    id: 65,
    x: 9,
    y: 7,
    connections: [64, 66]
  },
  {
    id: 66,
    x: 10,
    y: 7,
    connections: [65, 67]
  },
  {
    id: 67,
    x: 11,
    y: 7,
    connections: [66, 68, 71],
    type: 'BLOCK_MARKER'
  },
  {
    id: 68,
    x: 12,
    y: 7,
    connections: [67, 69]
  },
  {
    id: 69,
    x: 13,
    y: 7,
    connections: [68, 60]
  },
  {
    id: 70,
    x: 7,
    y: 8,
    connections: [63, 72]
  },
  {
    id: 71,
    x: 11,
    y: 8,
    connections: [67, 76]
  },
  {
    id: 72,
    x: 7,
    y: 9,
    connections: [70, 73]
  },
  {
    id: 73,
    x: 8,
    y: 9,
    connections: [72, 74]
  },
  {
    id: 74,
    x: 9,
    y: 9,
    connections: [73, 75, 77],
    type: 'BLOCK_MARKER'
  },
  {
    id: 75,
    x: 10,
    y: 9,
    connections: [74, 76]
  },
  {
    id: 76,
    x: 11,
    y: 9,
    connections: [75, 71]
  },
  {
    id: 77,
    x: 9,
    y: 10,
    connections: [74, 87],
    type: 'BLOCK_MARKER'
  },
  {
    id: 78,
    x: 1,
    y: 11,
    connections: [79, 96]
  },
  {
    id: 79,
    x: 2,
    y: 11,
    connections: [78, 80]
  },
  {
    id: 81,
    x: 3,
    y: 11,
    connections: [79, 82]
  },
  {
    id: 82,
    x: 4,
    y: 11,
    connections: [81, 83]
  },
  {
    id: 83,
    x: 5,
    y: 11,
    connections: [82, 84]
  },
  {
    id: 84,
    x: 6,
    y: 11,
    connections: [83, 85]
  },
  {
    id: 85,
    x: 7,
    y: 11,
    connections: [84, 86]
  },
  {
    id: 86,
    x: 8,
    y: 11,
    connections: [85, 87]
  },
  {
    id: 87,
    x: 9,
    y: 11,
    connections: [77, 86, 88],
    type: 'BLOCK_MARKER'
  },
  {
    id: 88,
    x: 10,
    y: 11,
    connections: [87, 89]
  },
  {
    id: 89,
    x: 11,
    y: 11,
    connections: [88, 90]
  },
  {
    id: 90,
    x: 12,
    y: 11,
    connections: [89, 91]
  },
  {
    id: 91,
    x: 13,
    y: 11,
    connections: [90, 92]
  },
  {
    id: 92,
    x: 14,
    y: 11,
    connections: [91, 93]
  },
  {
    id: 93,
    x: 15,
    y: 11,
    connections: [92, 94]
  },
  {
    id: 94,
    x: 16,
    y: 11,
    connections: [93, 95]
  },
  {
    id: 95,
    x: 17,
    y: 11,
    connections: [94, 97]
  },
  {
    id: 96,
    x: 1,
    y: 12,
    connections: [78, 98]
  },
  {
    id: 97,
    x: 17,
    y: 12,
    connections: [95, 114]
  },
  {
    id: 98,
    x: 1,
    y: 13,
    connections: [96, 99]
  },
  {
    id: 99,
    x: 2,
    y: 13,
    connections: [98, 100]
  },
  {
    id: 100,
    x: 3,
    y: 13,
    connections: [99, 101]
  },
  {
    id: 101,
    x: 4,
    y: 13,
    connections: [100, 102]
  },
  {
    id: 102,
    x: 5,
    y: 13,
    connections: [101, 103]
  },
  {
    id: 103,
    x: 6,
    y: 13,
    connections: [102, 104]
  },
  {
    id: 104,
    x: 7,
    y: 13,
    connections: [103, 105]
  },
  {
    id: 105,
    x: 8,
    y: 13,
    connections: [104, 106]
  },
  {
    id: 106,
    x: 9,
    y: 13,
    connections: [105, 107, 115],
    type: 'BLOCK_MARKER'
  },
  {
    id: 107,
    x: 10,
    y: 13,
    connections: [106, 108]
  },
  {
    id: 108,
    x: 11,
    y: 13,
    connections: [107, 109]
  },
  {
    id: 109,
    x: 12,
    y: 13,
    connections: [108, 110]
  },
  {
    id: 110,
    x: 13,
    y: 13,
    connections: [109, 111]
  },
  {
    id: 111,
    x: 14,
    y: 13,
    connections: [110, 112]
  },
  {
    id: 112,
    x: 15,
    y: 13,
    connections: [111, 113]
  },
  {
    id: 113,
    x: 16,
    y: 13,
    connections: [112, 114]
  },
  {
    id: 114,
    x: 17,
    y: 13,
    connections: [113, 97]
  },
  {
    id: 115,
    x: 9,
    y: 14,
    connections: [106],
    type: 'FINISH'
  },
  {
    id: 1000,
    x: 3,
    y: 0,
    connections: [3],
    color: 'RED'
  },
  {
    id: 1001,
    x: 2,
    y: -0.66,
    connections: [3],
    color: 'RED'
  },
  {
    id: 1002,
    x: 4,
    y: -0.66,
    connections: [3],
    color: 'RED'
  },
  {
    id: 1003,
    x: 2.33,
    y: -1.66,
    connections: [3],
    color: 'RED'
  },
  {
    id: 1004,
    x: 3.67,
    y: -1.66,
    connections: [3],
    color: 'RED'
  },
  {
    id: 1005,
    x: 7,
    y: 0,
    connections: [7],
    color: 'GREEN'
  },
  {
    id: 1006,
    x: 6,
    y: -0.66,
    connections: [7],
    color: 'GREEN'
  },
  {
    id: 1007,
    x: 8,
    y: -0.66,
    connections: [7],
    color: 'GREEN'
  },
  {
    id: 1008,
    x: 6.33,
    y: -1.66,
    connections: [7],
    color: 'GREEN'
  },
  {
    id: 1009,
    x: 7.67,
    y: -1.66,
    connections: [7],
    color: 'GREEN'
  },
  {
    id: 1010,
    x: 11,
    y: 0,
    connections: [11],
    color: 'YELLOW'
  },
  {
    id: 1011,
    x: 10,
    y: -0.66,
    connections: [11],
    color: 'YELLOW'
  },
  {
    id: 1012,
    x: 12,
    y: -0.66,
    connections: [11],
    color: 'YELLOW'
  },
  {
    id: 1013,
    x: 10.33,
    y: -1.66,
    connections: [11],
    color: 'YELLOW'
  },
  {
    id: 1014,
    x: 11.67,
    y: -1.66,
    connections: [11],
    color: 'YELLOW'
  },
  {
    id: 1015,
    x: 15,
    y: 0,
    connections: [15],
    color: 'BLUE'
  },
  {
    id: 1016,
    x: 14,
    y: -0.66,
    connections: [15],
    color: 'BLUE'
  },
  {
    id: 1017,
    x: 16,
    y: -0.66,
    connections: [15],
    color: 'BLUE'
  },
  {
    id: 1018,
    x: 14.33,
    y: -1.66,
    connections: [15],
    color: 'BLUE'
  },
  {
    id: 1019,
    x: 15.67,
    y: -1.66,
    connections: [15],
    color: 'BLUE'
  }
]

export const defaultBlocks: number[] = positions.filter(p => p.type == 'BLOCK_MARKER').map(p => p.id)

export const winningPosId = positions.filter(p => p.type == 'FINISH')[0].id