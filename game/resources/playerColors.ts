export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'

export const activeColors: PlayerColor[] = ['RED', 'BLUE', 'YELLOW', 'GREEN']

export const nextPlayerColor = (activePlayerColor: PlayerColor) => {
  const colorOrder: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE']
  const activeColorOrder = colorOrder.filter(c => activeColors.includes(c))

  const index = activeColorOrder.indexOf(activePlayerColor)

  const nextPlayerColor = activeColorOrder[(index + 1) % (activeColorOrder.length )]

  return nextPlayerColor
}