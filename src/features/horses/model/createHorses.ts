import { randomInt, sample, type RandomSource } from '@/shared/lib/random'
import { CONDITION_MAX, CONDITION_MIN, HORSE_COUNT } from './constants'
import { HORSE_NAMES } from './names'
import { HORSE_PALETTE } from './palette'
import type { Horse } from './types'

export function createHorses(random: RandomSource, count: number = HORSE_COUNT): Horse[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`Horse count must be a positive integer, received ${count}`)
  }
  if (count > HORSE_NAMES.length || count > HORSE_PALETTE.length) {
    throw new RangeError(
      `Cannot create ${count} unique horses from ${HORSE_NAMES.length} names and ${HORSE_PALETTE.length} colours`,
    )
  }

  const names = sample(random, HORSE_NAMES, count)
  const colors = sample(random, HORSE_PALETTE, count)

  return names.map((name, index) => ({
    id: index + 1,
    name,
    condition: randomInt(random, CONDITION_MIN, CONDITION_MAX),
    color: colors[index] as Horse['color'],
  }))
}
