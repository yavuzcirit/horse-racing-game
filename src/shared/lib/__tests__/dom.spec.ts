import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion, revealInContainer } from '../dom'

function box(top: number, bottom: number): DOMRect {
  return { top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top } as DOMRect
}

function setup(containerBox: DOMRect, elementBox: DOMRect) {
  const container = document.createElement('div')
  const element = document.createElement('div')
  container.getBoundingClientRect = () => containerBox
  element.getBoundingClientRect = () => elementBox
  container.scrollBy = vi.fn<(options?: ScrollToOptions) => void>() as HTMLElement['scrollBy']
  return { container, element }
}

describe('revealInContainer', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('scrolls up when the element is above the visible area', () => {
    const { container, element } = setup(box(100, 300), box(40, 80))
    revealInContainer(container, element)
    expect(container.scrollBy).toHaveBeenCalledWith({ top: -60, behavior: 'smooth' })
  })

  it('scrolls down when the element is below the visible area', () => {
    const { container, element } = setup(box(100, 300), box(280, 360))
    revealInContainer(container, element)
    expect(container.scrollBy).toHaveBeenCalledWith({ top: 60, behavior: 'smooth' })
  })

  it('leaves the container alone when the element is already visible', () => {
    const { container, element } = setup(box(100, 300), box(150, 200))
    revealInContainer(container, element)
    expect(container.scrollBy).not.toHaveBeenCalled()
  })

  it('jumps instead of animating when the user prefers reduced motion', () => {
    window.matchMedia = vi.fn<(query: string) => Pick<MediaQueryList, 'matches'>>(() => ({
      matches: true,
    })) as unknown as typeof window.matchMedia
    const { container, element } = setup(box(100, 300), box(280, 360))
    revealInContainer(container, element)
    expect(prefersReducedMotion()).toBe(true)
    expect(container.scrollBy).toHaveBeenCalledWith({ top: 60, behavior: 'auto' })
  })
})
