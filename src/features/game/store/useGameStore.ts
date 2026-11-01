import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useCommentaryStore } from '@/features/commentary'
import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '@/features/race'
import { createSeed, deriveSeed } from '@/shared/lib/seed'
import { SNAPSHOT_VERSION, type GameSnapshot } from '../model/snapshot'

export interface InitializeOptions {
  readonly seed: number | null
  readonly saved: GameSnapshot | null
}

export const useGameStore = defineStore('game', () => {
  const horses = useHorsesStore()
  const race = useRaceStore()
  const commentary = useCommentaryStore()

  const seed = ref(0)
  const programCount = ref(0)

  function startSession(sessionSeed: number) {
    seed.value = sessionSeed
    programCount.value = 0
    horses.generate(sessionSeed)
    race.reset()
    commentary.reset()
  }

  function resume(snapshot: GameSnapshot): boolean {
    startSession(snapshot.seed)
    if (snapshot.race === null) return true

    programCount.value = snapshot.programCount
    race.generateProgram(deriveSeed(snapshot.seed, snapshot.programCount))
    return race.restore(snapshot.race)
  }

  function initialize({ seed: requestedSeed, saved }: InitializeOptions) {
    const canResume = saved !== null && (requestedSeed === null || requestedSeed === saved.seed)
    if (canResume && resume(saved)) return
    startSession(requestedSeed ?? createSeed())
  }

  function newSession() {
    if (race.canGenerate) startSession(createSeed())
  }

  function generateProgram() {
    const nextCount = programCount.value + 1
    if (!race.generateProgram(deriveSeed(seed.value, nextCount))) return
    programCount.value = nextCount
    commentary.reset()
  }

  function advance(deltaMs: number) {
    const before = race.captureMoment()
    race.tick(deltaMs)
    commentary.observe(before, race.captureMoment(), race.plans)
  }

  function toSnapshot(): GameSnapshot {
    return {
      version: SNAPSHOT_VERSION,
      seed: seed.value,
      programCount: programCount.value,
      race: race.hasProgram ? race.captureProgress() : null,
    }
  }

  return { seed, programCount, initialize, newSession, generateProgram, advance, toSnapshot }
})
