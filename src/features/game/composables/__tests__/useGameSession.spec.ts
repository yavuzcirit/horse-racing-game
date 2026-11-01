import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryStorage, installManualAnimationFrames } from '@/__tests__/factories'
import { useRaceStore } from '@/features/race'
import { SESSION_STORAGE_KEY, type GameSnapshot } from '../../model/snapshot'
import { useGameStore } from '../../store/useGameStore'
import { useGameSession, type GameSessionOptions } from '../useGameSession'

function mountSession(options: GameSessionOptions) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const Host = defineComponent({
    setup() {
      useGameSession(options)
      return () => null
    },
  })
  return mount(Host, { global: { plugins: [pinia] } })
}

function storedSnapshot(storage: ReturnType<typeof createMemoryStorage>): GameSnapshot {
  return JSON.parse(storage.data.get(SESSION_STORAGE_KEY) ?? 'null') as GameSnapshot
}

describe('useGameSession', () => {
  let storage: ReturnType<typeof createMemoryStorage>
  let frames: ReturnType<typeof installManualAnimationFrames>

  beforeEach(() => {
    storage = createMemoryStorage()
    frames = installManualAnimationFrames()
  })

  it('starts a session from the ?seed= parameter', () => {
    mountSession({ search: '?seed=31', storage })
    expect(useGameStore().seed).toBe(31)
  })

  it('saves the session whenever the program state changes', async () => {
    mountSession({ search: '?seed=31', storage })
    useGameStore().generateProgram()
    await nextTick()

    expect(storedSnapshot(storage)).toMatchObject({
      seed: 31,
      programCount: 1,
      race: { status: 'ready', roundIndex: 0 },
    })
  })

  it('restores the saved session', () => {
    const saved: GameSnapshot = { version: 1, seed: 77, programCount: 0, race: null }
    storage.data.set(SESSION_STORAGE_KEY, JSON.stringify(saved))

    mountSession({ search: '', storage })

    expect(useGameStore().seed).toBe(77)
  })

  it('drives the race with animation frames only while it runs', async () => {
    mountSession({ search: '?seed=31', storage })
    const race = useRaceStore()
    useGameStore().generateProgram()
    expect(frames.pending).toBe(0)

    race.start()
    await nextTick()
    frames.frame(0)
    frames.frame(50)
    expect(race.elapsedMs).toBeGreaterThan(0)

    race.pause()
    await nextTick()
    expect(frames.pending).toBe(0)
  })

  it('saves when the page is hidden or closed', async () => {
    mountSession({ search: '?seed=31', storage })
    const race = useRaceStore()
    useGameStore().generateProgram()
    race.start()
    await nextTick()
    frames.frame(0)
    frames.frame(80)

    window.dispatchEvent(new Event('pagehide'))
    expect(storedSnapshot(storage).race?.elapsedMs).toBe(race.elapsedMs)

    frames.frame(160)
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(storedSnapshot(storage).race?.elapsedMs).toBe(race.elapsedMs)
    Reflect.deleteProperty(document, 'visibilityState')
  })

  it('cleans up its listeners and the loop when unmounted', async () => {
    const wrapper = mountSession({ search: '?seed=31', storage })
    useGameStore().generateProgram()
    useRaceStore().start()
    await nextTick()

    wrapper.unmount()
    storage.data.clear()
    window.dispatchEvent(new Event('pagehide'))

    expect(storage.data.size).toBe(0)
    expect(frames.pending).toBe(0)
  })
})
