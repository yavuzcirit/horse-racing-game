import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHorsesStore } from '@/features/horses'
import { INTERMISSION_MS, TIME_SCALE, type RaceSpeed } from '../../model/constants'
import { useRaceStore, type RaceProgress } from '../useRaceStore'

type RaceStore = ReturnType<typeof useRaceStore>

function runUntil(store: RaceStore, done: () => boolean, stepMs = 100, maxSteps = 20_000) {
  for (let step = 0; step < maxSteps && !done(); step++) store.tick(stepMs)
  if (!done()) throw new Error('Condition was never reached')
}

function readyStore() {
  const store = useRaceStore()
  store.generateProgram(1234)
  return store
}

describe('useRaceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useHorsesStore().generate(42)
  })

  describe('before a program exists', () => {
    it('is idle and cannot start', () => {
      const store = useRaceStore()
      expect(store.status).toBe('idle')
      expect(store.hasProgram).toBe(false)
      expect(store.canStart).toBe(false)
      expect(store.canGenerate).toBe(true)
      expect(store.lanes).toEqual([])
      expect(store.activeHorseIds.size).toBe(0)
    })

    it('ignores start and tick', () => {
      const store = useRaceStore()
      store.start()
      store.tick(1_000)
      expect(store.status).toBe('idle')
      expect(store.elapsedMs).toBe(0)
    })
  })

  describe('generateProgram', () => {
    it('draws six rounds with a race plan each and gets ready', () => {
      const store = readyStore()
      expect(store.status).toBe('ready')
      expect(store.rounds).toHaveLength(6)
      expect(store.plans).toHaveLength(6)
      expect(store.currentRound?.distance).toBe(1200)
      expect(store.canStart).toBe(true)
    })

    it('fills ten lanes for the first round, all at the gate', () => {
      const store = readyStore()
      expect(store.lanes.map((lane) => lane.lane)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(store.lanes.every((lane) => lane.progress === 0 && !lane.finished)).toBe(true)
      expect([...store.activeHorseIds]).toEqual(store.rounds[0]?.horseIds)
    })

    it('is reproducible from the program seed', () => {
      const first = readyStore().rounds
      setActivePinia(createPinia())
      useHorsesStore().generate(42)
      expect(readyStore().rounds).toEqual(first)
    })

    it('is ignored while a race is running', () => {
      const store = readyStore()
      const rounds = store.rounds
      store.start()
      expect(store.generateProgram(999)).toBe(false)
      expect(store.rounds).toBe(rounds)
    })

    it('starts over after a paused or finished program', () => {
      const store = readyStore()
      store.start()
      runUntil(store, () => store.results.length === 1)
      store.pause()

      expect(store.generateProgram(55)).toBe(true)
      expect(store.results).toEqual([])
      expect(store.currentRoundIndex).toBe(0)
      expect(store.elapsedMs).toBe(0)
      expect(store.status).toBe('ready')
    })
  })

  describe('start and pause', () => {
    it('toggles between running and paused', () => {
      const store = readyStore()
      store.toggle()
      expect(store.status).toBe('running')
      expect(store.isRunning).toBe(true)
      store.toggle()
      expect(store.status).toBe('paused')
      store.toggle()
      expect(store.status).toBe('running')
    })

    it('ignores pause when nothing is running', () => {
      const store = readyStore()
      store.pause()
      expect(store.status).toBe('ready')
    })

    it('freezes the race clock while paused', () => {
      const store = readyStore()
      store.start()
      store.tick(500)
      store.pause()
      const frozenAt = store.elapsedMs
      store.tick(500)
      expect(store.elapsedMs).toBe(frozenAt)
    })
  })

  describe('tick', () => {
    it('advances the race clock by real time × time scale × speed', () => {
      const store = readyStore()
      store.start()
      store.tick(100)
      expect(store.elapsedMs).toBe(100 * TIME_SCALE)

      store.setSpeed(4)
      store.tick(100)
      expect(store.elapsedMs).toBe(100 * TIME_SCALE * 5)
    })

    it.each([0, -16, Number.NaN, Number.POSITIVE_INFINITY])('ignores a delta of %s', (delta) => {
      const store = readyStore()
      store.start()
      store.tick(delta)
      expect(store.elapsedMs).toBe(0)
    })

    it('moves the horses along the track', () => {
      const store = readyStore()
      store.start()
      store.tick(2_000)
      expect(store.lanes.every((lane) => lane.progress > 0 && lane.progress < 1)).toBe(true)
    })

    it('records the result when the last horse finishes, then takes a break', () => {
      const store = readyStore()
      store.start()
      runUntil(store, () => store.results.length === 1)

      const [result] = store.results
      expect(result?.roundIndex).toBe(0)
      expect(result?.placements.map((placement) => placement.position)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
      const times = result!.placements.map((placement) => placement.finishTimeMs)
      expect(times).toEqual([...times].sort((a, b) => a - b))
      expect(store.phase).toBe('intermission')
      expect(store.lanes.every((lane) => lane.finished && lane.progress === 1)).toBe(true)
    })

    it('moves on to the next round after the break', () => {
      const store = readyStore()
      store.start()
      runUntil(store, () => store.phase === 'intermission')
      store.tick(INTERMISSION_MS - 1)
      expect(store.currentRoundIndex).toBe(0)
      store.tick(1)
      expect(store.currentRoundIndex).toBe(1)
      expect(store.phase).toBe('racing')
      expect(store.elapsedMs).toBe(0)
      expect(store.currentRound?.distance).toBe(1400)
    })

    it('runs all six rounds in order and finishes', () => {
      const store = readyStore()
      store.start()
      runUntil(store, () => store.status === 'finished')

      expect(store.results.map((result) => result.distance)).toEqual([
        1200, 1400, 1600, 1800, 2000, 2200,
      ])
      expect(store.canStart).toBe(false)
      expect(store.canGenerate).toBe(true)
      expect(store.activeHorseIds.size).toBe(0)

      store.tick(1_000)
      expect(store.results).toHaveLength(6)
    })
  })

  describe('setSpeed', () => {
    it('ignores speeds that are not offered', () => {
      const store = useRaceStore()
      store.setSpeed(3 as RaceSpeed)
      expect(store.speed).toBe(1)
    })
  })

  describe('capture and restore', () => {
    function progress(overrides: Partial<RaceProgress> = {}): RaceProgress {
      return {
        status: 'running',
        phase: 'racing',
        roundIndex: 2,
        elapsedMs: 30_000,
        intermissionMs: 0,
        completedRounds: 2,
        speed: 2,
        ...overrides,
      }
    }

    it('captures the current moment and progress', () => {
      const store = readyStore()
      store.start()
      store.tick(100)
      expect(store.captureMoment()).toEqual({
        status: 'running',
        phase: 'racing',
        roundIndex: 0,
        elapsedMs: 1_000,
      })
      expect(store.captureProgress()).toMatchObject({ completedRounds: 0, speed: 1 })
    })

    it('resumes a race that was running as paused', () => {
      const store = readyStore()
      expect(store.restore(progress())).toBe(true)
      expect(store.status).toBe('paused')
      expect(store.currentRoundIndex).toBe(2)
      expect(store.elapsedMs).toBe(30_000)
      expect(store.results.map((result) => result.roundIndex)).toEqual([0, 1])
      expect(store.speed).toBe(2)
    })

    it('restores a break between rounds', () => {
      const store = readyStore()
      const restored = store.restore(
        progress({ phase: 'intermission', completedRounds: 3, intermissionMs: 400 }),
      )
      expect(restored).toBe(true)
      expect(store.elapsedMs).toBe(store.plans[2]?.durationMs)
      expect(store.intermissionMs).toBe(400)
    })

    it('restores a finished program', () => {
      const store = readyStore()
      expect(
        store.restore(progress({ status: 'finished', roundIndex: 5, completedRounds: 6 })),
      ).toBe(true)
      expect(store.status).toBe('finished')
      expect(store.results).toHaveLength(6)
    })

    it('keeps an untouched program ready', () => {
      const store = readyStore()
      store.restore(progress({ status: 'ready', roundIndex: 0, elapsedMs: 0, completedRounds: 0 }))
      expect(store.status).toBe('ready')
    })

    it('clamps a race clock that is past the end of the round', () => {
      const store = readyStore()
      store.restore(progress({ elapsedMs: 9_999_999 }))
      expect(store.elapsedMs).toBe(store.plans[2]?.durationMs)
    })

    it.each<[string, Partial<RaceProgress>]>([
      ['a round that does not exist', { roundIndex: 6 }],
      ['results that do not match the round', { completedRounds: 1 }],
      ['a finished program that stopped early', { status: 'finished', completedRounds: 3 }],
      ['an idle program', { status: 'idle' }],
    ])('rejects %s', (_, overrides) => {
      const store = readyStore()
      expect(store.restore(progress(overrides))).toBe(false)
      expect(store.status).toBe('ready')
    })
  })
})
