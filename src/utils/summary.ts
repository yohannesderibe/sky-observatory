/** Builds a short plain-language line like "Warmer than yesterday. Light breeze." from raw Celsius/km-h values. */
export function buildSummaryLine(todayMax: number, yesterdayMax: number | null, windSpeedKmh: number): string {
  let tempPart = "Here's today's outlook."
  if (yesterdayMax !== null) {
    const diff = todayMax - yesterdayMax
    if (diff > 1.5) tempPart = 'Warmer than yesterday.'
    else if (diff < -1.5) tempPart = 'Cooler than yesterday.'
    else tempPart = 'About the same as yesterday.'
  }

  let windPart = ''
  if (windSpeedKmh >= 30) windPart = ' Quite windy out there.'
  else if (windSpeedKmh >= 15) windPart = ' A bit breezy.'
  else if (windSpeedKmh <= 5) windPart = ' Calm air right now.'

  return tempPart + windPart
}
