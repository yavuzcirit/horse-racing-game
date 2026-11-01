import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCommentaryStore } from '@/features/commentary'
import { createHorses, useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'
import { createRandom } from '@/shared/lib/random'
import { isSeed } from '@/shared/lib/seed'
import type { GameSnapshot } from '../../model/snapshot'
import { useGameStore } from '../useGameStore'

function freshStores() {
  setActivePinia(createPinia())
  return {
    game: useGameStore(),
    horses: useHorsesStore(),
    race: useRaceStore(),
    commentary: useCommentaryStore(),
  }
}

function advanceUntil(game: ReturnType<typeof useGameStore>, done: () => boolean) {
  for (let step = 0; step < 20_000 && !done(); step++) game.advance(50)
  if (!done()) throw new Error('Condition was never reached')
}

describe('useGameStore', () => {
  let stores: ReturnType<typeof freshStores>

  beforeEach(() => {
    stores = freshStores()
  })

  describe('initialize', () => {
    it('starts a session from the requested seed', () => {
      const { game, horses, race } = stores
      game.initialize({ seed: 7, saved: null })
      expect(game.seed).toBe(7)
      expect(game.programCount).toBe(0)
      expect(horses.horses).toEqual(createHorses(createRandom(7)))
      expect(race.status).toBe('idle')
    })

    it('picks a random seed when none is requested', () => {
      const { game, horses } = stores
      game.initialize({ seed: null, saved: null })
      expect(isSeed(game.seed)).toBe(true)
      expect(horses.horses).toHaveLength(20)
    })
  })

  describe('generateProgram', () => {
    it('draws a new program each time and clears the commentary', () => {
      const { game, race, commentary } = stores
      game.initialize({ seed: 7, saved: null })

      game.generateProgram()
      const firstProgram = race.rounds
      race.start()
      game.advance(100)
      expect(commentary.entries.length).toBeGreaterThan(0)
      race.pause()

      game.generateProgram()
      expect(game.programCount).toBe(2)
      expect(race.rounds).not.toEqual(firstProgram)
      expect(race.status).toBe('ready')
      expect(commentary.entries).toEqual([])
    })

    it('reproduces the same programs from the same seed', () => {
      stores.game.initialize({ seed: 7, saved: null })
      stores.game.generateProgram()
      const rounds = stores.race.rounds

      const other = freshStores()
      other.game.initialize({ seed: 7, saved: null })
      other.game.generateProgram()
      expect(other.race.rounds).toEqual(rounds)
    })

    it('does nothing while a race is running', () => {
      const { game, race } = stores
      game.initialize({ seed: 7, saved: null })
      game.generateProgram()
      race.start()
      game.generateProgram()
      expect(game.programCount).toBe(1)
    })
  })

  describe('advance', () => {
    it('moves the race and lets the commentator follow it', () => {
      const { game, race, commentary } = stores
      game.initialize({ seed: 7, saved: null })
      game.generateProgram()
      race.start()

      advanceUntil(game, () => race.results.length === 1)

      const types = commentary.entries.map((entry) => entry.event.type)
      expect(types[0]).toBe('round-start')
      expect(types).toContain('winner')
    })
  })

  describe('newSession', () => {
    it('brings in new horses and clears the program', () => {
      const { game, horses, race } = stores
      game.initialize({ seed: 7, saved: null })
      game.generateProgram()
      const previousHorses = horses.horses

      game.newSession()

      expect(horses.horses).not.toEqual(previousHorses)
      expect(game.programCount).toBe(0)
      expect(race.status).toBe('idle')
    })

    it('is ignored while a race is running', () => {
      const { game, race } = stores
      game.initialize({ seed: 7, saved: null })
      game.generateProgram()
      race.start()
      game.newSession()
      expect(game.seed).toBe(7)
    })
  })

  describe('snapshots', () => {
    function playIntoSecondRound() {
      const { game, race } = stores
      game.initialize({ seed: 99, saved: null })
      game.generateProgram()
      game.generateProgram()
      race.setSpeed(2)
      race.start()
      advanceUntil(game, () => race.currentRoundIndex === 1 && race.elapsedMs > 20_000)
      return game.toSnapshot()
    }

    it('describes a session without a program', () => {
      stores.game.initialize({ seed: 5, saved: null })
      expect(stores.game.toSnapshot()).toEqual({ version: 1, seed: 5, programCount: 0, race: null })
    })

    it('resumes a saved session exactly where it stopped, paused', () => {
      const saved = playIntoSecondRound()
      const { rounds, results, elapsedMs } = stores.race
      const horses = stores.horses.horses

      const next = freshStores()
      next.game.initialize({ seed: null, saved })

      expect(next.horses.horses).toEqual(horses)
      expect(next.race.rounds).toEqual(rounds)
      expect(next.race.results).toEqual(results)
      expect(next.race.currentRoundIndex).toBe(1)
      expect(next.race.elapsedMs).toBe(elapsedMs)
      expect(next.race.status).toBe('paused')
      expect(next.race.speed).toBe(2)
      expect(next.game.programCount).toBe(2)
    })

    it('resumes a saved session without a program', () => {
      const next = freshStores()
      next.game.initialize({
        seed: null,
        saved: { version: 1, seed: 12, programCount: 0, race: null },
      })
      expect(next.game.seed).toBe(12)
      expect(next.race.status).toBe('idle')
    })

    it('prefers an explicitly requested seed over a saved session', () => {
      const saved = playIntoSecondRound()
      const next = freshStores()
      next.game.initialize({ seed: 1, saved })
      expect(next.game.seed).toBe(1)
      expect(next.race.status).toBe('idle')
    })

    it('starts fresh when the saved progress does not fit the program', () => {
      const saved = playIntoSecondRound()
      const corrupted: GameSnapshot = { ...saved, race: { ...saved.race!, completedRounds: 4 } }

      const next = freshStores()
      next.game.initialize({ seed: null, saved: corrupted })

      expect(next.game.programCount).toBe(0)
      expect(next.race.status).toBe('idle')
      expect(next.race.rounds).toEqual([])
    })
  })
})
