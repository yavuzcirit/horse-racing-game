import { describe, expect, it } from 'vitest'
import { SNAPSHOT_VERSION, isGameSnapshot, type GameSnapshot } from '../snapshot'

const fresh: GameSnapshot = { version: SNAPSHOT_VERSION, seed: 42, programCount: 0, race: null }

const midRace: GameSnapshot = {
  version: SNAPSHOT_VERSION,
  seed: 42,
  programCount: 3,
  race: {
    status: 'paused',
    phase: 'racing',
    roundIndex: 2,
    elapsedMs: 12_345.6,
    intermissionMs: 0,
    completedRounds: 2,
    speed: 2,
  },
}

describe('isGameSnapshot', () => {
  it.each([
    ['a session without a program', fresh],
    ['a session in the middle of a race', midRace],
  ])('accepts %s', (_, snapshot) => {
    expect(isGameSnapshot(JSON.parse(JSON.stringify(snapshot)))).toBe(true)
  })

  it.each<[string, unknown]>([
    ['null', null],
    ['an array', [fresh]],
    ['a string', JSON.stringify(fresh)],
    ['another version', { ...fresh, version: 2 }],
    ['a negative seed', { ...fresh, seed: -1 }],
    ['a fractional seed', { ...fresh, seed: 1.5 }],
    ['a seed above 32 bits', { ...fresh, seed: 2 ** 32 }],
    ['a seed given as text', { ...fresh, seed: '42' }],
    ['a race without a program', { ...fresh, race: midRace.race }],
    ['a program without a race', { ...midRace, race: null }],
    ['an unknown status', { ...midRace, race: { ...midRace.race, status: 'hacked' } }],
    ['an unknown phase', { ...midRace, race: { ...midRace.race, phase: 'warmup' } }],
    ['an unsupported speed', { ...midRace, race: { ...midRace.race, speed: 100 } }],
    ['a negative race clock', { ...midRace, race: { ...midRace.race, elapsedMs: -1 } }],
    ['an absurd round index', { ...midRace, race: { ...midRace.race, roundIndex: 1_000 } }],
    ['a missing field', { ...midRace, race: { ...midRace.race, completedRounds: undefined } }],
    ['a huge program count', { ...midRace, programCount: 10_000_000 }],
  ])('rejects %s', (_, value) => {
    expect(isGameSnapshot(value)).toBe(false)
  })
})
