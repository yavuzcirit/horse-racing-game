import { describe, expect, it } from 'vitest'
import { makeHorse } from '@/__tests__/factories'
import type { Horse, HorseId } from '@/features/horses'
import { createRandom } from '@/shared/lib/random'
import { DEFAULT_RACE_MODEL, planRace } from '../planRace'
import { finishOrder } from '../progress'
import type { Round } from '../types'

const stable = new Map<HorseId, Horse>(
  Array.from({ length: 10 }, (_, index) => {
    const horse = makeHorse(index + 1, { condition: (index + 1) * 10 })
    return [horse.id, horse] as const
  }),
)

const round: Round = { index: 0, distance: 1200, horseIds: [3, 1, 4, 10, 5, 9, 2, 6, 8, 7] }

describe('planRace', () => {
  const plan = planRace(round, stable, createRandom(77))

  it('plans one run per horse in gate order', () => {
    expect(plan.roundIndex).toBe(0)
    expect(plan.distance).toBe(1200)
    expect(plan.runs.map((run) => run.horseId)).toEqual(round.horseIds)
    expect(plan.runs.map((run) => run.lane)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('splits every run into 200 m checkpoints with increasing times', () => {
    for (const run of plan.runs) {
      expect(run.checkpoints.map((checkpoint) => checkpoint.metres)).toEqual([
        200, 400, 600, 800, 1000, 1200,
      ])
      const times = run.checkpoints.map((checkpoint) => checkpoint.atMs)
      expect(times.every((time, index) => index === 0 || time > times[index - 1]!)).toBe(true)
      expect(run.finishTimeMs).toBe(times.at(-1))
    }
  })

  it('ends when the slowest horse crosses the line', () => {
    expect(plan.durationMs).toBe(Math.max(...plan.runs.map((run) => run.finishTimeMs)))
  })

  it('produces realistic race times', () => {
    for (const run of plan.runs) {
      expect(run.finishTimeMs).toBeGreaterThan(55_000)
      expect(run.finishTimeMs).toBeLessThan(95_000)
    }
  })

  it('is reproducible from a seed', () => {
    expect(planRace(round, stable, createRandom(77))).toEqual(plan)
    expect(planRace(round, stable, createRandom(78))).not.toEqual(plan)
  })

  it('handles distances that are not a multiple of the segment length', () => {
    const odd = planRace({ ...round, distance: 1300 }, stable, createRandom(1))
    expect(odd.runs[0]?.checkpoints.at(-1)?.metres).toBe(1300)
    expect(odd.runs[0]?.checkpoints.at(-2)?.metres).toBe(1200)
  })

  it('refuses horses that are not in the stable', () => {
    expect(() => planRace({ ...round, horseIds: [99] }, stable, createRandom(1))).toThrow(
      'Horse 99',
    )
  })
})

describe('race model', () => {
  function headToHead(conditionA: number, conditionB: number, races: number) {
    const horses = new Map<HorseId, Horse>([
      [1, makeHorse(1, { condition: conditionA })],
      [2, makeHorse(2, { condition: conditionB })],
    ])
    const random = createRandom(2_026)
    let winsForA = 0
    for (let i = 0; i < races; i++) {
      const plan = planRace({ index: 0, distance: 1600, horseIds: [1, 2] }, horses, random)
      if (finishOrder(plan)[0]?.horseId === 1) winsForA += 1
    }
    return winsForA / races
  }

  it('lets a horse in much better condition win almost every time', () => {
    expect(headToHead(100, 1, 1_000)).toBeGreaterThan(0.99)
  })

  it('favours the better horse in a close match-up while still allowing upsets', () => {
    const share = headToHead(60, 50, 2_000)
    expect(share).toBeGreaterThan(0.55)
    expect(share).toBeLessThan(0.85)
  })

  it('is tuned with sensible defaults', () => {
    expect(DEFAULT_RACE_MODEL.segmentLength).toBe(200)
    expect(DEFAULT_RACE_MODEL.baseSpeed + DEFAULT_RACE_MODEL.conditionBonus).toBeLessThan(20)
  })
})
