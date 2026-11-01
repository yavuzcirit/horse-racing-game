import type { HorseId } from '@/features/horses'
import { sample, type RandomSource } from '@/shared/lib/random'
import { HORSES_PER_ROUND, ROUND_DISTANCES } from './constants'
import type { Round } from './types'

export interface ScheduleOptions {
  readonly distances?: readonly number[]
  readonly fieldSize?: number
}

export function createSchedule(
  horseIds: readonly HorseId[],
  random: RandomSource,
  { distances = ROUND_DISTANCES, fieldSize = HORSES_PER_ROUND }: ScheduleOptions = {},
): Round[] {
  if (new Set(horseIds).size !== horseIds.length) {
    throw new Error('Horse ids in a schedule must be unique')
  }
  if (horseIds.length < fieldSize) {
    throw new RangeError(`A round needs ${fieldSize} horses but only ${horseIds.length} exist`)
  }
  if (distances.some((distance) => !Number.isInteger(distance) || distance <= 0)) {
    throw new RangeError('Round distances must be positive whole metres')
  }

  return distances.map((distance, index) => ({
    index,
    distance,
    horseIds: sample(random, horseIds, fieldSize),
  }))
}
