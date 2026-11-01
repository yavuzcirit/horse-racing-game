import { describe, expect, it } from 'vitest'
import { formatDistance, formatGap, formatRaceTime } from '../format'

describe('formatDistance', () => {
  it('prints metres', () => {
    expect(formatDistance(1200)).toBe('1200 m')
  })
})

describe('formatRaceTime', () => {
  it.each([
    [0, '0:00.00'],
    [72_345, '1:12.35'],
    [59_999, '1:00.00'],
    [125_004, '2:05.00'],
    [-50, '0:00.00'],
  ])('formats %i ms as %s', (milliseconds, expected) => {
    expect(formatRaceTime(milliseconds)).toBe(expected)
  })
})

describe('formatGap', () => {
  it('prints hundredths of a second', () => {
    expect(formatGap(84)).toBe('0.08 s')
    expect(formatGap(1_250)).toBe('1.25 s')
  })
})
