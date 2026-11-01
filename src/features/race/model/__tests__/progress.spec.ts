import { describe, expect, it } from 'vitest'
import { makePlan, makeRun } from '@/__tests__/factories'
import {
  createResult,
  distanceAt,
  finishOrder,
  leaderAt,
  progressAt,
  standingsAt,
} from '../progress'

const steady = makeRun(1, 1, [
  { atMs: 1_000, metres: 100 },
  { atMs: 3_000, metres: 200 },
])

describe('distanceAt', () => {
  it.each([
    [-50, 0],
    [0, 0],
    [500, 50],
    [1_000, 100],
    [2_000, 150],
    [3_000, 200],
    [9_000, 200],
  ])('at %i ms the horse has covered %i m', (elapsedMs, metres) => {
    expect(distanceAt(steady, elapsedMs)).toBeCloseTo(metres)
  })
})

describe('progressAt', () => {
  it('is the share of the distance covered, clamped to [0, 1]', () => {
    expect(progressAt(steady, 200, 2_000)).toBeCloseTo(0.75)
    expect(progressAt(steady, 200, 10_000)).toBe(1)
    expect(progressAt(steady, 200, -1)).toBe(0)
  })

  it('never divides by a zero distance', () => {
    expect(progressAt(steady, 0, 1_000)).toBe(0)
  })
})

describe('standings', () => {
  const fastStarter = makeRun(1, 1, [
    { atMs: 1_000, metres: 500 },
    { atMs: 5_000, metres: 1_000 },
  ])
  const strongFinisher = makeRun(2, 2, [
    { atMs: 2_000, metres: 500 },
    { atMs: 4_000, metres: 1_000 },
  ])
  const deadHeat = makeRun(3, 3, [{ atMs: 4_000, metres: 1_000 }])
  const plan = makePlan([fastStarter, strongFinisher, deadHeat])

  it('orders horses by distance covered', () => {
    expect(standingsAt(plan, 1_000).map((run) => run.horseId)).toEqual([1, 2, 3])
    expect(leaderAt(plan, 1_000)?.horseId).toBe(1)
    expect(leaderAt(plan, 3_500)?.horseId).toBe(2)
  })

  it('orders finished horses by time, then lane', () => {
    expect(standingsAt(plan, 6_000).map((run) => run.horseId)).toEqual([2, 3, 1])
    expect(finishOrder(plan).map((run) => run.horseId)).toEqual([2, 3, 1])
  })

  it('has no leader without runners', () => {
    expect(leaderAt(makePlan([]), 1_000)).toBeNull()
  })

  it('turns a plan into numbered placements', () => {
    const result = createResult(plan)
    expect(result).toEqual({
      roundIndex: 0,
      distance: 1_000,
      placements: [
        { position: 1, horseId: 2, lane: 2, finishTimeMs: 4_000 },
        { position: 2, horseId: 3, lane: 3, finishTimeMs: 4_000 },
        { position: 3, horseId: 1, lane: 1, finishTimeMs: 5_000 },
      ],
    })
  })
})
