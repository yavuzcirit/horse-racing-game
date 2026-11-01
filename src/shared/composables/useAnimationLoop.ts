import { onScopeDispose, readonly, ref } from 'vue'

export const MAX_FRAME_DELTA_MS = 100

export function useAnimationLoop(onFrame: (deltaMs: number) => void) {
  const isActive = ref(false)
  let frameId: number | null = null
  let lastTimestamp: number | null = null

  function frame(timestamp: number) {
    frameId = null
    const deltaMs =
      lastTimestamp === null
        ? 0
        : Math.min(Math.max(timestamp - lastTimestamp, 0), MAX_FRAME_DELTA_MS)
    lastTimestamp = timestamp

    onFrame(deltaMs)

    if (isActive.value && frameId === null) {
      frameId = requestAnimationFrame(frame)
    }
  }

  function start() {
    if (isActive.value) return
    isActive.value = true
    lastTimestamp = null
    frameId = requestAnimationFrame(frame)
  }

  function stop() {
    isActive.value = false
    lastTimestamp = null
    if (frameId !== null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
  }

  onScopeDispose(stop)

  return { isActive: readonly(isActive), start, stop }
}
