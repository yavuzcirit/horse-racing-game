export const ROUND_DISTANCES: readonly number[] = [1200, 1400, 1600, 1800, 2000, 2200]

export const HORSES_PER_ROUND = 10

export const TIME_SCALE = 10

export const INTERMISSION_MS = 1500

export const SPEED_OPTIONS = [1, 2, 4] as const

export type RaceSpeed = (typeof SPEED_OPTIONS)[number]

export const RACE_STATUSES = ['idle', 'ready', 'running', 'paused', 'finished'] as const

export const RACE_PHASES = ['racing', 'intermission'] as const
