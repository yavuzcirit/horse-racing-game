import { onScopeDispose } from 'vue'

export function useEventListener<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  listener: (event: WindowEventMap[K]) => void,
): void
export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
): void
export function useEventListener(
  target: EventTarget,
  type: string,
  listener: (event: Event) => void,
): void {
  target.addEventListener(type, listener)
  onScopeDispose(() => target.removeEventListener(type, listener))
}
