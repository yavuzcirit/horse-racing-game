import { describe, expect, it } from 'vitest'
import { formatEvent } from '../formatEvent'
import type { CommentaryEvent } from '../types'

const names: Record<number, string> = { 1: 'Ada Lovelace', 2: 'Grace Hopper' }
const nameOf = (id: number) => names[id] ?? `Horse ${id}`

describe('formatEvent', () => {
  it.each<[CommentaryEvent, string]>([
    [
      { type: 'round-start', roundIndex: 1, distance: 1400, fieldSize: 10 },
      "And they're off! Round 2: 10 runners over 1400 m.",
    ],
    [
      { type: 'lead-change', roundIndex: 0, horseId: 1, early: true },
      'Ada Lovelace breaks well and takes the early lead.',
    ],
    [
      { type: 'final-stretch', roundIndex: 0, horseId: 2 },
      "Into the final stretch, and it's Grace Hopper in front!",
    ],
    [
      { type: 'photo-finish', roundIndex: 0, winnerId: 1, runnerUpId: 2, marginMs: 80 },
      'Photo finish! Ada Lovelace edges out Grace Hopper by 0.08 s.',
    ],
    [
      { type: 'winner', roundIndex: 2, horseId: 2, finishTimeMs: 98_765 },
      'Grace Hopper wins Round 3 in 1:38.77.',
    ],
    [{ type: 'program-complete', rounds: 6 }, "That's all 6 rounds done. Thanks for watching!"],
  ])('formats %j', (event, expected) => {
    expect(formatEvent(event, nameOf)).toBe(expected)
  })

  it('varies the wording of repeated lead changes', () => {
    const event: CommentaryEvent = { type: 'lead-change', roundIndex: 0, horseId: 2, early: false }
    const lines = new Set([0, 1, 2, 3].map((variant) => formatEvent(event, nameOf, variant)))
    expect(lines.size).toBe(4)
    expect([...lines].every((line) => line.includes('Grace Hopper'))).toBe(true)
    expect(formatEvent(event, nameOf, -1)).toBe(formatEvent(event, nameOf, 1))
  })
})
