export function formatCurrentTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)

  const pad = (n: number) => n.toString().padStart(2, "0")

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatFastestLap(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  const milliseconds = Math.floor((timeInSeconds * 1000) % 1000)

  const pad = (n: number, length = 2) => n.toString().padStart(length, "0")

  return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`
}

export const generateColor = (id: number): string => {
  // A golden ratio conjugate approximation for a good spread of hues
  const hue = (id * 137.508) % 360
  return `hsl(${hue}, 60%, 80%)`
}
