import type { HorseId } from '@/features/horses'
import { formatDistance, formatGap, formatRaceTime } from '@/shared/lib/format'
import type { CommentaryEvent } from './types'

export type NameResolver = (horseId: HorseId) => string

const LEAD_CHANGE_LINES: readonly ((name: string) => string)[] = [
  (name) => `${name} takes the lead!`,
  (name) => `${name} hits the front!`,
  (name) => `${name} surges past to lead the field.`,
  (name) => `Change at the top: ${name} is in front.`,
]

export function formatEvent(event: CommentaryEvent, nameOf: NameResolver, variant = 0): string {
  switch (event.type) {
    case 'round-start':
      return `And they're off! Round ${event.roundIndex + 1}: ${event.fieldSize} runners over ${formatDistance(event.distance)}.`
    case 'lead-change': {
      const name = nameOf(event.horseId)
      if (event.early) return `${name} breaks well and takes the early lead.`
      const line = LEAD_CHANGE_LINES[Math.abs(variant) % LEAD_CHANGE_LINES.length]
      return line ? line(name) : `${name} takes the lead!`
    }
    case 'final-stretch':
      return `Into the final stretch, and it's ${nameOf(event.horseId)} in front!`
    case 'photo-finish':
      return `Photo finish! ${nameOf(event.winnerId)} edges out ${nameOf(event.runnerUpId)} by ${formatGap(event.marginMs)}.`
    case 'winner':
      return `${nameOf(event.horseId)} wins Round ${event.roundIndex + 1} in ${formatRaceTime(event.finishTimeMs)}.`
    case 'program-complete':
      return `That's all ${event.rounds} rounds done. Thanks for watching!`
  }
}
