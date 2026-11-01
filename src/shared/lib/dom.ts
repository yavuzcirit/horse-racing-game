export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

export function revealInContainer(container: HTMLElement, element: HTMLElement): void {
  const containerBox = container.getBoundingClientRect()
  const elementBox = element.getBoundingClientRect()
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'

  if (elementBox.top < containerBox.top) {
    container.scrollBy({ top: elementBox.top - containerBox.top, behavior })
  } else if (elementBox.bottom > containerBox.bottom) {
    container.scrollBy({ top: elementBox.bottom - containerBox.bottom, behavior })
  }
}
