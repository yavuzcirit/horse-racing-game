import { vi } from 'vitest'
import type { Horse, HorseId } from '@/features/horses'
import type { Checkpoint, HorseRun, RaceMoment, RacePlan } from '@/features/race'

export function makeHorse(id: HorseId, overrides: Partial<Horse> = {}): Horse {
  return {
    id,
    name: `Horse ${id}`,
    condition: 50,
    color: { name: `Colour ${id}`, hex: '#336699' },
    ...overrides,
  }
}

export function makeRun(
  horseId: HorseId,
  lane: number,
  checkpoints: readonly Checkpoint[],
): HorseRun {
  return {
    horseId,
    lane,
    checkpoints,
    finishTimeMs: checkpoints.at(-1)?.atMs ?? 0,
  }
}

export function makePlan(runs: readonly HorseRun[], distance = 1000, roundIndex = 0): RacePlan {
  return {
    roundIndex,
    distance,
    runs,
    durationMs: Math.max(0, ...runs.map((run) => run.finishTimeMs)),
  }
}

export function makeMoment(elapsedMs: number, overrides: Partial<RaceMoment> = {}): RaceMoment {
  return { status: 'running', phase: 'racing', roundIndex: 0, elapsedMs, ...overrides }
}

export function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

export function installManualAnimationFrames() {
  const callbacks = new Map<number, FrameRequestCallback>()
  let nextHandle = 1

  const request = (callback: FrameRequestCallback) => {
    const handle = nextHandle++
    callbacks.set(handle, callback)
    return handle
  }
  const cancel = (handle: number) => void callbacks.delete(handle)

  vi.stubGlobal('requestAnimationFrame', request)
  vi.stubGlobal('cancelAnimationFrame', cancel)

  return {
    get pending() {
      return callbacks.size
    },
    frame(timestamp: number) {
      const due = [...callbacks.values()]
      callbacks.clear()
      due.forEach((callback) => callback(timestamp))
    },
  }
}
