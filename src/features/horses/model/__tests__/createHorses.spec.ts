import { describe, expect, it } from 'vitest'
import { createRandom } from '@/shared/lib/random'
import { CONDITION_MAX, CONDITION_MIN, HORSE_COUNT } from '../constants'
import { createHorses } from '../createHorses'
import { HORSE_NAMES } from '../names'
import { HORSE_PALETTE } from '../palette'

describe('createHorses', () => {
  const horses = createHorses(createRandom(2024))

  it('creates twenty horses numbered 1 to 20', () => {
    expect(horses).toHaveLength(HORSE_COUNT)
    expect(horses.map((horse) => horse.id)).toEqual(
      Array.from({ length: HORSE_COUNT }, (_, index) => index + 1),
    )
  })

  it('gives every horse a unique name and a unique colour', () => {
    expect(new Set(horses.map((horse) => horse.name)).size).toBe(HORSE_COUNT)
    expect(new Set(horses.map((horse) => horse.color.hex)).size).toBe(HORSE_COUNT)
    expect(new Set(horses.map((horse) => horse.color.name)).size).toBe(HORSE_COUNT)
  })

  it('keeps every condition a whole number between 1 and 100', () => {
    for (const horse of horses) {
      expect(Number.isInteger(horse.condition)).toBe(true)
      expect(horse.condition).toBeGreaterThanOrEqual(CONDITION_MIN)
      expect(horse.condition).toBeLessThanOrEqual(CONDITION_MAX)
    }
  })

  it('is reproducible from a seed', () => {
    expect(createHorses(createRandom(2024))).toEqual(horses)
    expect(createHorses(createRandom(2025))).not.toEqual(horses)
  })

  it('can build a smaller stable', () => {
    expect(createHorses(createRandom(1), 1)).toHaveLength(1)
  })

  it.each([0, -3, 2.5, Math.max(HORSE_NAMES.length, HORSE_PALETTE.length) + 1])(
    'refuses to create %s horses',
    (count) => {
      expect(() => createHorses(createRandom(1), count)).toThrow(RangeError)
    },
  )
})

describe('horse pools', () => {
  it('have enough unique names and colours for a full stable', () => {
    expect(new Set(HORSE_NAMES).size).toBe(HORSE_NAMES.length)
    expect(new Set(HORSE_PALETTE.map((color) => color.hex)).size).toBe(HORSE_PALETTE.length)
    expect(HORSE_NAMES.length).toBeGreaterThanOrEqual(HORSE_COUNT)
    expect(HORSE_PALETTE.length).toBeGreaterThanOrEqual(HORSE_COUNT)
  })

  it('only contains valid hex colours', () => {
    expect(HORSE_PALETTE.every((color) => /^#[0-9a-f]{6}$/i.test(color.hex))).toBe(true)
  })
})
