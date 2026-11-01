import { describe, expect, it } from 'vitest'
import { createRandom, randomBetween, randomInt, sample, shuffle } from '../random'

const draw = (seed: number, count: number) => {
  const random = createRandom(seed)
  return Array.from({ length: count }, () => random.next())
}

describe('createRandom', () => {
  it('replays the same sequence for the same seed', () => {
    expect(draw(42, 10)).toEqual(draw(42, 10))
  })

  it('produces a different sequence for a different seed', () => {
    expect(draw(42, 10)).not.toEqual(draw(43, 10))
  })

  it('only returns values in [0, 1)', () => {
    const values = draw(7, 10_000)
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
  })
})

describe('randomInt', () => {
  it('covers the whole inclusive range', () => {
    const random = createRandom(1)
    const seen = new Set(Array.from({ length: 1_000 }, () => randomInt(random, 1, 6)))
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('returns the only value of a single-value range', () => {
    expect(randomInt(createRandom(1), 5, 5)).toBe(5)
  })

  it.each([
    [5, 1],
    [1.5, 3],
    [1, Number.NaN],
  ])('rejects the invalid range [%s, %s]', (min, max) => {
    expect(() => randomInt(createRandom(1), min, max)).toThrow(RangeError)
  })
})

describe('randomBetween', () => {
  it('stays inside the bounds', () => {
    const random = createRandom(3)
    const values = Array.from({ length: 1_000 }, () => randomBetween(random, -0.5, 0.5))
    expect(values.every((value) => value >= -0.5 && value < 0.5)).toBe(true)
  })
})

describe('shuffle', () => {
  it('keeps every item exactly once without touching the input', () => {
    const input = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8])
    const result = shuffle(createRandom(9), input)
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input])
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('is deterministic for a seed', () => {
    expect(shuffle(createRandom(5), [1, 2, 3, 4, 5])).toEqual(
      shuffle(createRandom(5), [1, 2, 3, 4, 5]),
    )
  })
})

describe('sample', () => {
  it('picks the requested number of distinct items from the list', () => {
    const items = Array.from({ length: 20 }, (_, index) => index)
    const picked = sample(createRandom(11), items, 10)
    expect(picked).toHaveLength(10)
    expect(new Set(picked).size).toBe(10)
    expect(picked.every((item) => items.includes(item))).toBe(true)
  })

  it.each([-1, 4, 1.5])('rejects a count of %s for a list of three', (count) => {
    expect(() => sample(createRandom(1), ['a', 'b', 'c'], count)).toThrow(RangeError)
  })
})
