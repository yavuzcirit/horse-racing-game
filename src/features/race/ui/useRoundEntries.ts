import { useHorsesStore, type HorseId } from '@/features/horses'
import type { RoundTableEntry } from './types'

export function useRoundEntries() {
  const horsesStore = useHorsesStore()

  function toEntry(horseId: HorseId, position: number, finishTimeMs?: number): RoundTableEntry {
    const horse = horsesStore.byId.get(horseId)
    const entry = {
      position,
      horseId,
      name: horse?.name ?? `Horse ${horseId}`,
      color: horse?.color.hex ?? 'transparent',
    }
    return finishTimeMs === undefined ? entry : { ...entry, finishTimeMs }
  }

  return { toEntry }
}
