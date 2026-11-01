import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeMoment, makePlan, makeRun } from '@/__tests__/factories'
import { MAX_COMMENTARY_ENTRIES } from '../../model/constants'
import { useCommentaryStore } from '../useCommentaryStore'

const plans = [makePlan([makeRun(1, 1, [{ atMs: 10_000, metres: 1_000 }])])]
const finishing = makeMoment(10_000, { phase: 'intermission' })
const finished = makeMoment(10_000, { phase: 'intermission', status: 'finished' })

describe('useCommentaryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('records what happened between two moments', () => {
    const store = useCommentaryStore()
    store.observe(makeMoment(0), makeMoment(500), plans)
    expect(store.entries).toEqual([
      { id: 1, event: { type: 'round-start', roundIndex: 0, distance: 1_000, fieldSize: 1 } },
    ])
  })

  it('leaves the feed untouched when nothing happened', () => {
    const store = useCommentaryStore()
    const before = store.entries
    store.observe(makeMoment(500), makeMoment(500), plans)
    expect(store.entries).toBe(before)
  })

  it('keeps only the latest entries', () => {
    const store = useCommentaryStore()
    for (let i = 0; i < MAX_COMMENTARY_ENTRIES + 10; i++) store.observe(finishing, finished, plans)

    expect(store.entries).toHaveLength(MAX_COMMENTARY_ENTRIES)
    expect(store.entries.at(-1)?.id).toBe(MAX_COMMENTARY_ENTRIES + 10)
  })

  it('clears the feed on reset but never reuses ids', () => {
    const store = useCommentaryStore()
    store.observe(finishing, finished, plans)
    store.reset()
    expect(store.entries).toEqual([])

    store.observe(finishing, finished, plans)
    expect(store.entries[0]?.id).toBe(2)
  })
})
