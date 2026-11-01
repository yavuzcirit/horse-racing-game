import type { HorseId } from '@/features/horses'

export interface RoundTableEntry {
  readonly position: number
  readonly horseId: HorseId
  readonly name: string
  readonly color: string
  readonly finishTimeMs?: number
}

export interface LaneRunner {
  readonly name: string
  readonly color: string
  readonly progress: number
  readonly finished: boolean
}
