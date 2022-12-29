export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'

export const activeColors = (red: boolean = true, green: boolean = true, yellow: boolean = true, blue: boolean = true) => {
  const colors: PlayerColor[] = []
  red && colors.push('RED')
  green && colors.push('GREEN')
  yellow && colors.push('YELLOW')
  blue && colors.push('BLUE')

  return colors
}

export const nextPlayerColor = (activePlayerColor: PlayerColor, activeColors: PlayerColor[]) => {
  const colorOrder: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE']
  const activeColorOrder = colorOrder.filter(c => activeColors.includes(c))

  const index = activeColorOrder.indexOf(activePlayerColor)

  const nextPlayerColor = activeColorOrder[(index + 1) % (activeColorOrder.length )]

  return nextPlayerColor
}