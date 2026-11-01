import { RACE_PHASES, RACE_STATUSES, SPEED_OPTIONS, type RaceProgress } from '@/features/race'
import {
  isFiniteNonNegative,
  isNonNegativeInteger,
  isOneOf,
  isRecord,
} from '@/shared/persistence/guards'
import { isSeed } from '@/shared/lib/seed'

export const SNAPSHOT_VERSION = 1

export const SESSION_STORAGE_KEY = 'horse-racing:session'

export interface GameSnapshot {
  readonly version: typeof SNAPSHOT_VERSION
  readonly seed: number
  readonly programCount: number
  readonly race: RaceProgress | null
}

const MAX_PROGRAM_COUNT = 1_000_000
const MAX_ROUND_INDEX = 99
const MAX_RACE_CLOCK_MS = 60 * 60 * 1000

export function isGameSnapshot(value: unknown): value is GameSnapshot {
  if (!isRecord(value)) return false
  if (value.version !== SNAPSHOT_VERSION || !isSeed(value.seed)) return false
  if (!isNonNegativeInteger(value.programCount, MAX_PROGRAM_COUNT)) return false

  return value.programCount === 0 ? value.race === null : isRaceProgress(value.race)
}

function isRaceProgress(value: unknown): value is RaceProgress {
  return (
    isRecord(value) &&
    isOneOf(RACE_STATUSES, value.status) &&
    isOneOf(RACE_PHASES, value.phase) &&
    isNonNegativeInteger(value.roundIndex, MAX_ROUND_INDEX) &&
    isFiniteNonNegative(value.elapsedMs, MAX_RACE_CLOCK_MS) &&
    isFiniteNonNegative(value.intermissionMs, MAX_RACE_CLOCK_MS) &&
    isNonNegativeInteger(value.completedRounds, MAX_ROUND_INDEX + 1) &&
    isOneOf(SPEED_OPTIONS, value.speed)
  )
}
