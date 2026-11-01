import type { HorseId } from '@/features/horses'

export type CommentaryEvent =
  | {
      readonly type: 'round-start'
      readonly roundIndex: number
      readonly distance: number
      readonly fieldSize: number
    }
  | {
      readonly type: 'lead-change'
      readonly roundIndex: number
      readonly horseId: HorseId
      readonly early: boolean
    }
  | {
      readonly type: 'final-stretch'
      readonly roundIndex: number
      readonly horseId: HorseId
    }
  | {
      readonly type: 'photo-finish'
      readonly roundIndex: number
      readonly winnerId: HorseId
      readonly runnerUpId: HorseId
      readonly marginMs: number
    }
  | {
      readonly type: 'winner'
      readonly roundIndex: number
      readonly horseId: HorseId
      readonly finishTimeMs: number
    }
  | {
      readonly type: 'program-complete'
      readonly rounds: number
    }

export type CommentaryEventType = CommentaryEvent['type']

export interface CommentaryEntry {
  readonly id: number
  readonly event: CommentaryEvent
}

export interface CommentaryMemory {
  readonly roundIndex: number | null
  readonly announcedLeaderId: HorseId | null
  readonly lastLeadCallMs: number
  readonly finalStretchCalled: boolean
}
