import { nextTick, watch, type Ref, type WatchSource } from 'vue'
import { revealInContainer } from '@/shared/lib/dom'

export function useRevealLatest(
  source: WatchSource,
  container: Readonly<Ref<HTMLElement | null | undefined>>,
  selector: string,
) {
  watch(source, async () => {
    await nextTick()
    const root = container.value
    const target = root?.querySelector<HTMLElement>(selector)
    if (root && target) revealInContainer(root, target)
  })
}
