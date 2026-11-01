import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { RaceMoment, RacePlan } from '@/features/race'
import { MAX_COMMENTARY_ENTRIES } from '../model/constants'
import { detectEvents, initialMemory } from '../model/detectEvents'
import type { CommentaryEntry } from '../model/types'

export const useCommentaryStore = defineStore('commentary', () => {
  const entries = shallowRef<readonly CommentaryEntry[]>([])

  let memory = initialMemory()
  let nextId = 1

  function observe(previous: RaceMoment, next: RaceMoment, plans: readonly RacePlan[]) {
    const detection = detectEvents(previous, next, plans, memory)
    memory = detection.memory
    if (detection.events.length === 0) return

    const added = detection.events.map((event) => ({ id: nextId++, event }))
    entries.value = [...entries.value, ...added].slice(-MAX_COMMENTARY_ENTRIES)
  }

  function reset() {
    entries.value = []
    memory = initialMemory()
  }

  return { entries, observe, reset }
})
