import { describe, expect, it } from 'vitest'
import { createSeed, deriveSeed, isSeed, parseSeed, readSeedFromUrl } from '../seed'

describe('parseSeed', () => {
  it.each([
    ['0', 0],
    ['42', 42],
    ['4294967295', 4_294_967_295],
  ])('accepts %s', (raw, expected) => {
    expect(parseSeed(raw)).toBe(expected)
  })

  it.each([null, undefined, '', ' 42', '-1', '1e3', '0x10', '4.2', '4294967296', '12345678901'])(
    'rejects %s',
    (raw) => {
      expect(parseSeed(raw)).toBeNull()
    },
  )
})

describe('readSeedFromUrl', () => {
  it('reads the seed parameter from a query string', () => {
    expect(readSeedFromUrl('?mode=demo&seed=1234')).toBe(1234)
  })

  it('ignores a missing or malformed seed', () => {
    expect(readSeedFromUrl('')).toBeNull()
    expect(readSeedFromUrl('?seed=<script>')).toBeNull()
  })
})

describe('deriveSeed', () => {
  it('is deterministic and stays an unsigned 32-bit integer', () => {
    const derived = deriveSeed(42, 1)
    expect(deriveSeed(42, 1)).toBe(derived)
    expect(isSeed(derived)).toBe(true)
  })

  it('gives a different seed for every salt', () => {
    const seeds = new Set(Array.from({ length: 100 }, (_, salt) => deriveSeed(42, salt)))
    expect(seeds.size).toBe(100)
  })
})

describe('createSeed', () => {
  it('returns an unsigned 32-bit integer', () => {
    expect(isSeed(createSeed())).toBe(true)
  })
})

describe('isSeed', () => {
  it.each([0, 1, 4_294_967_295])('accepts %s', (value) => {
    expect(isSeed(value)).toBe(true)
  })

  it.each([-1, 1.5, 4_294_967_296, '1', null, Number.NaN])('rejects %s', (value) => {
    expect(isSeed(value)).toBe(false)
  })
})
