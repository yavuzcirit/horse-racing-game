import { effectScope } from 'vue'
import { describe, expect, it } from 'vitest'
import { installManualAnimationFrames } from '@/__tests__/factories'
import { MAX_FRAME_DELTA_MS, useAnimationLoop } from '../useAnimationLoop'

function setup(onFrame: (delta: number) => void = () => {}) {
  const frames = installManualAnimationFrames()
  const scope = effectScope()
  const loop = scope.run(() => useAnimationLoop(onFrame))!
  return { frames, scope, loop }
}

describe('useAnimationLoop', () => {
  it('reports the time between frames, starting from zero', () => {
    const deltas: number[] = []
    const { frames, loop } = setup((delta) => deltas.push(delta))

    loop.start()
    frames.frame(1_000)
    frames.frame(1_016)
    frames.frame(1_050)

    expect(deltas).toEqual([0, 16, 34])
    expect(loop.isActive.value).toBe(true)
  })

  it('clamps long gaps, e.g. after the tab was in the background', () => {
    const deltas: number[] = []
    const { frames, loop } = setup((delta) => deltas.push(delta))

    loop.start()
    frames.frame(0)
    frames.frame(5_000)
    frames.frame(4_990)

    expect(deltas).toEqual([0, MAX_FRAME_DELTA_MS, 0])
  })

  it('stops requesting frames once stopped', () => {
    const { frames, loop } = setup()

    loop.start()
    frames.frame(0)
    loop.stop()

    expect(frames.pending).toBe(0)
    expect(loop.isActive.value).toBe(false)
  })

  it('can be stopped from inside a frame callback', () => {
    let count = 0
    const { frames, loop } = setup(() => {
      count += 1
      loop.stop()
    })

    loop.start()
    frames.frame(0)
    frames.frame(16)

    expect(count).toBe(1)
    expect(frames.pending).toBe(0)
  })

  it('keeps a single frame queued when restarted from inside a callback', () => {
    const { frames, loop } = setup(() => {
      loop.stop()
      loop.start()
    })

    loop.start()
    frames.frame(0)

    expect(frames.pending).toBe(1)
  })

  it('ignores repeated starts', () => {
    const { frames, loop } = setup()
    loop.start()
    loop.start()
    expect(frames.pending).toBe(1)
  })

  it('stops when the owning scope is disposed', () => {
    const { frames, scope, loop } = setup()
    loop.start()
    scope.stop()
    expect(frames.pending).toBe(0)
    expect(loop.isActive.value).toBe(false)
  })
})
