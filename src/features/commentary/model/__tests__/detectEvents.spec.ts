import { describe, expect, it } from 'vitest'
import { makeMoment, makePlan, makeRun } from '@/__tests__/factories'
import { detectEvents, initialMemory } from '../detectEvents'
import type { CommentaryMemory } from '../types'

const steady = makeRun(1, 1, [
  { atMs: 30_000, metres: 500 },
  { atMs: 60_000, metres: 1_000 },
])
const frontRunner = makeRun(2, 2, [
  { atMs: 20_000, metres: 500 },
  { atMs: 60_100, metres: 1_000 },
])
const backmarker = makeRun(3, 3, [
  { atMs: 40_000, metres: 500 },
  { atMs: 80_000, metres: 1_000 },
])
const plans = [makePlan([steady, frontRunner, backmarker])]

function detect(fromMs: number, toMs: number, memory: CommentaryMemory = initialMemory(0)) {
  return detectEvents(makeMoment(fromMs), makeMoment(toMs), plans, memory)
}

describe('detectEvents', () => {
  it('announces the start and the early leader', () => {
    const { events, memory } = detect(0, 5_000, initialMemory())
    expect(events).toEqual([
      { type: 'round-start', roundIndex: 0, distance: 1_000, fieldSize: 3 },
      { type: 'lead-change', roundIndex: 0, horseId: 2, early: true },
    ])
    expect(memory).toMatchObject({ roundIndex: 0, announcedLeaderId: 2, lastLeadCallMs: 5_000 })
  })

  it('waits until the leader has a real advantage before calling it', () => {
    expect(detect(0, 1_000).events.map((event) => event.type)).toEqual(['round-start'])
  })

  it('does not repeat a leader that was already called', () => {
    const { memory } = detect(0, 5_000)
    expect(detect(5_000, 20_000, memory).events).toEqual([])
  })

  it('calls the final stretch once', () => {
    const { memory } = detect(0, 5_000)
    const stretch = detect(39_000, 41_000, memory)
    expect(stretch.events).toEqual([{ type: 'final-stretch', roundIndex: 0, horseId: 2 }])
    expect(detect(41_000, 45_000, stretch.memory).events).toEqual([])
  })

  it('calls a late change of lead', () => {
    const { memory } = detect(39_000, 41_000, detect(0, 5_000).memory)
    expect(detect(59_500, 59_900, memory).events).toEqual([
      { type: 'lead-change', roundIndex: 0, horseId: 1, early: false },
    ])
  })

  it('does not call lead changes back to back', () => {
    const memory: CommentaryMemory = {
      ...initialMemory(0),
      announcedLeaderId: 2,
      lastLeadCallMs: 59_000,
    }
    expect(detect(59_500, 59_900, { ...memory, finalStretchCalled: true }).events).toEqual([])
  })

  it('announces a photo finish and the winner when the first horse crosses the line', () => {
    expect(detect(59_900, 60_050).events).toEqual([
      { type: 'photo-finish', roundIndex: 0, winnerId: 1, runnerUpId: 2, marginMs: 100 },
      { type: 'winner', roundIndex: 0, horseId: 1, finishTimeMs: 60_000 },
    ])
  })

  it('skips the photo finish when the winner is clear', () => {
    const clear = [makePlan([steady, backmarker])]
    const { events } = detectEvents(makeMoment(59_000), makeMoment(61_000), clear, initialMemory(0))
    expect(events.map((event) => event.type)).toEqual(['winner'])
  })

  it('stays quiet once the winner is home', () => {
    expect(detect(60_050, 75_000).events).toEqual([])
  })

  it('does not announce a start when resuming in the middle of a round', () => {
    const { events, memory } = detect(10_000, 10_500, initialMemory())
    expect(events.some((event) => event.type === 'round-start')).toBe(false)
    expect(memory.roundIndex).toBe(0)
  })

  it('ignores breaks between rounds and unknown rounds', () => {
    const fromBreak = detectEvents(
      makeMoment(0, { phase: 'intermission' }),
      makeMoment(1_000),
      plans,
      initialMemory(),
    )
    expect(fromBreak.events).toEqual([])

    const unknownRound = detectEvents(
      makeMoment(0, { roundIndex: 4 }),
      makeMoment(1_000, { roundIndex: 4 }),
      plans,
      initialMemory(),
    )
    expect(unknownRound.events).toEqual([])
  })

  it('announces the end of the program', () => {
    const { events } = detectEvents(
      makeMoment(80_000, { phase: 'intermission' }),
      makeMoment(80_000, { phase: 'intermission', status: 'finished' }),
      plans,
      initialMemory(0),
    )
    expect(events).toEqual([{ type: 'program-complete', rounds: 1 }])
  })
})
