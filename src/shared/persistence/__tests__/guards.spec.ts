import { describe, expect, it } from 'vitest'
import { isFiniteNonNegative, isNonNegativeInteger, isOneOf, isRecord } from '../guards'

describe('guards', () => {
  it('isRecord only accepts plain objects', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord([])).toBe(false)
    expect(isRecord(null)).toBe(false)
    expect(isRecord('x')).toBe(false)
  })

  it('isNonNegativeInteger honours the upper bound', () => {
    expect(isNonNegativeInteger(0)).toBe(true)
    expect(isNonNegativeInteger(5, 5)).toBe(true)
    expect(isNonNegativeInteger(6, 5)).toBe(false)
    expect(isNonNegativeInteger(-1)).toBe(false)
    expect(isNonNegativeInteger(1.5)).toBe(false)
    expect(isNonNegativeInteger('1')).toBe(false)
  })

  it('isFiniteNonNegative rejects NaN, infinity and negatives', () => {
    expect(isFiniteNonNegative(12.5)).toBe(true)
    expect(isFiniteNonNegative(Number.NaN)).toBe(false)
    expect(isFiniteNonNegative(Number.POSITIVE_INFINITY)).toBe(false)
    expect(isFiniteNonNegative(-0.1)).toBe(false)
    expect(isFiniteNonNegative(11, 10)).toBe(false)
  })

  it('isOneOf narrows to the listed options', () => {
    const options = ['a', 'b'] as const
    expect(isOneOf(options, 'a')).toBe(true)
    expect(isOneOf(options, 'c')).toBe(false)
  })
})
