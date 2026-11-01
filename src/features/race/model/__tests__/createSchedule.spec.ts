import { describe, expect, it } from 'vitest'
import { createRandom } from '@/shared/lib/random'
import { HORSES_PER_ROUND, ROUND_DISTANCES } from '../constants'
import { createSchedule } from '../createSchedule'

const horseIds = Array.from({ length: 20 }, (_, index) => index + 1)

describe('createSchedule', () => {
  const schedule = createSchedule(horseIds, createRandom(5))

  it('creates six rounds from 1200 m to 2200 m in order', () => {
    expect(schedule.map((round) => round.index)).toEqual([0, 1, 2, 3, 4, 5])
    expect(schedule.map((round) => round.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
    expect(ROUND_DISTANCES).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
  })

  it('puts ten different horses from the stable in every round', () => {
    for (const round of schedule) {
      expect(round.horseIds).toHaveLength(HORSES_PER_ROUND)
      expect(new Set(round.horseIds).size).toBe(HORSES_PER_ROUND)
      expect(round.horseIds.every((id) => horseIds.includes(id))).toBe(true)
    }
  })

  it('draws a different field for each round', () => {
    const fields = new Set(schedule.map((round) => [...round.horseIds].sort().join(',')))
    expect(fields.size).toBeGreaterThan(1)
  })

  it('is reproducible from a seed', () => {
    expect(createSchedule(horseIds, createRandom(5))).toEqual(schedule)
  })

  it('supports custom distances and field sizes', () => {
    const custom = createSchedule(horseIds, createRandom(1), { distances: [800], fieldSize: 4 })
    expect(custom).toHaveLength(1)
    expect(custom[0]?.distance).toBe(800)
    expect(custom[0]?.horseIds).toHaveLength(4)
  })

  it('needs enough horses to fill a round', () => {
    expect(() => createSchedule([1, 2, 3], createRandom(1))).toThrow(RangeError)
  })

  it('rejects duplicate horses', () => {
    expect(() => createSchedule([...horseIds, 1], createRandom(1))).toThrow('unique')
  })

  it.each([[[0]], [[-100]], [[1200.5]]])('rejects the distances %j', (distances) => {
    expect(() => createSchedule(horseIds, createRandom(1), { distances })).toThrow(RangeError)
  })
})
