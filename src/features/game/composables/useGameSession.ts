import { watch } from 'vue'
import { useRaceStore } from '@/features/race'
import { useAnimationLoop } from '@/shared/composables/useAnimationLoop'
import { useEventListener } from '@/shared/composables/useEventListener'
import { readSeedFromUrl } from '@/shared/lib/seed'
import { createPersistedValue, type StorageLike } from '@/shared/persistence/storage'
import { SESSION_STORAGE_KEY, isGameSnapshot } from '../model/snapshot'
import { useGameStore } from '../store/useGameStore'

export interface GameSessionOptions {
  readonly search?: string
  readonly storage?: StorageLike | null
}

export function useGameSession({ search, storage }: GameSessionOptions = {}) {
  const game = useGameStore()
  const race = useRaceStore()
  const session = createPersistedValue(SESSION_STORAGE_KEY, isGameSnapshot, storage)

  game.initialize({
    seed: readSeedFromUrl(search ?? window.location.search),
    saved: session.load(),
  })

  const loop = useAnimationLoop((deltaMs) => game.advance(deltaMs))

  watch(
    () => race.isRunning,
    (running) => (running ? loop.start() : loop.stop()),
    { immediate: true },
  )

  function save() {
    session.save(game.toSnapshot())
  }

  watch(
    () => [
      game.seed,
      game.programCount,
      race.status,
      race.phase,
      race.currentRoundIndex,
      race.results.length,
      race.speed,
    ],
    save,
  )

  useEventListener(window, 'pagehide', save)
  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') save()
  })
}
