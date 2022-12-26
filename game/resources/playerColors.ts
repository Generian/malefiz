export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'

export const nextPlayerColor = (activePlayerColor: PlayerColor) => {
  switch (activePlayerColor) {
    case 'RED':
      return 'GREEN'

    case 'GREEN':
      return 'YELLOW'

    case 'YELLOW':
      return 'BLUE'

    case 'BLUE':
      return 'RED'

    default:
      throw new Error("Unexpected player color given.")
  }
}