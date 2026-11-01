export function formatDistance(metres: number): string {
  return `${metres} m`
}

export function formatRaceTime(milliseconds: number): string {
  const totalCentiseconds = Math.round(Math.max(0, milliseconds) / 10)
  const minutes = Math.floor(totalCentiseconds / 6000)
  const seconds = Math.floor((totalCentiseconds % 6000) / 100)
  const centiseconds = totalCentiseconds % 100
  return `${minutes}:${pad(seconds)}.${pad(centiseconds)}`
}

export function formatGap(milliseconds: number): string {
  return `${(Math.max(0, milliseconds) / 1000).toFixed(2)} s`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
