import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRandom } from '@/shared/lib/random'
import { createHorses } from '../../model/createHorses'
import { useHorsesStore } from '../useHorsesStore'

describe('useHorsesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    expect(useHorsesStore().horses).toEqual([])
  })

  it('generates the stable from a seed', () => {
    const store = useHorsesStore()
    store.generate(99)
    expect(store.horses).toEqual(createHorses(createRandom(99)))
  })

  it('looks horses up by id', () => {
    const store = useHorsesStore()
    store.generate(99)
    const [first] = store.horses
    expect(store.byId.get(first!.id)).toEqual(first)
    expect(store.nameOf(first!.id)).toBe(first!.name)
  })

  it('falls back to a generic name for an unknown id', () => {
    expect(useHorsesStore().nameOf(404)).toBe('Horse 404')
  })
})
