export interface Logger {
  warn(message: string, detail?: unknown): void
  error(message: string, detail?: unknown): void
}

const PREFIX = '[horse-racing]'

export const logger: Logger = {
  warn(message, detail) {
    console.warn(`${PREFIX} ${message}`, detail ?? '')
  },
  error(message, detail) {
    console.error(`${PREFIX} ${message}`, detail ?? '')
  },
}
