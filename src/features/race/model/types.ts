import type { HorseId } from '@/features/horses'
import type { RACE_PHASES, RACE_STATUSES } from './constants'

export interface Round {
  readonly index: number
  readonly distance: number
  readonly horseIds: readonly HorseId[]
}

export interface Checkpoint {
  readonly atMs: number
  readonly metres: number
}

export interface HorseRun {
  readonly horseId: HorseId
  readonly lane: number
  readonly checkpoints: readonly Checkpoint[]
  readonly finishTimeMs: number
}

export interface RacePlan {
  readonly roundIndex: number
  readonly distance: number
  readonly runs: readonly HorseRun[]
  readonly durationMs: number
}

export interface Placement {
  readonly position: number
  readonly horseId: HorseId
  readonly lane: number
  readonly finishTimeMs: number
}

export interface RoundResult {
  readonly roundIndex: number
  readonly distance: number
  readonly placements: readonly Placement[]
}

export type RaceStatus = (typeof RACE_STATUSES)[number]

export type RacePhase = (typeof RACE_PHASES)[number]
