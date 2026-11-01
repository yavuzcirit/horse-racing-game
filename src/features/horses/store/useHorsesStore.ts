import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { createRandom } from '@/shared/lib/random'
import { createHorses } from '../model/createHorses'
import type { Horse, HorseId } from '../model/types'

export const useHorsesStore = defineStore('horses', () => {
  const horses = shallowRef<readonly Horse[]>([])

  const byId = computed<ReadonlyMap<HorseId, Horse>>(
    () => new Map(horses.value.map((horse) => [horse.id, horse])),
  )

  function generate(seed: number) {
    horses.value = createHorses(createRandom(seed))
  }

  function nameOf(id: HorseId): string {
    return byId.value.get(id)?.name ?? `Horse ${id}`
  }

  return { horses, byId, generate, nameOf }
})
