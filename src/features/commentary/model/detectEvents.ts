import { finishOrder, leaderAt, progressAt, type RaceMoment, type RacePlan } from '@/features/race'
import {
  FINAL_STRETCH_PROGRESS,
  LEAD_CALL_INTERVAL,
  LEAD_CALL_MIN_PROGRESS,
  PHOTO_FINISH_MARGIN_MS,
} from './constants'
import type { CommentaryEvent, CommentaryMemory } from './types'

export function initialMemory(roundIndex: number | null = null): CommentaryMemory {
  return {
    roundIndex,
    announcedLeaderId: null,
    lastLeadCallMs: Number.NEGATIVE_INFINITY,
    finalStretchCalled: false,
  }
}

export interface Detection {
  readonly events: CommentaryEvent[]
  readonly memory: CommentaryMemory
}

export function detectEvents(
  previous: RaceMoment,
  next: RaceMoment,
  plans: readonly RacePlan[],
  memory: CommentaryMemory,
): Detection {
  const events: CommentaryEvent[] = []
  let state = memory

  const plan = plans[next.roundIndex]
  const raceMoved =
    plan !== undefined &&
    previous.roundIndex === next.roundIndex &&
    previous.phase === 'racing' &&
    next.elapsedMs > previous.elapsedMs

  if (plan && raceMoved) {
    if (state.roundIndex !== plan.roundIndex) state = initialMemory(plan.roundIndex)

    if (previous.elapsedMs === 0) {
      events.push({
        type: 'round-start',
        roundIndex: plan.roundIndex,
        distance: plan.distance,
        fieldSize: plan.runs.length,
      })
    }

    const call = callTheRace(plan, previous.elapsedMs, next.elapsedMs, state)
    events.push(...call.events)
    state = call.memory
  }

  if (previous.status !== 'finished' && next.status === 'finished') {
    events.push({ type: 'program-complete', rounds: plans.length })
  }

  return { events, memory: state }
}

function callTheRace(
  plan: RacePlan,
  fromMs: number,
  toMs: number,
  memory: CommentaryMemory,
): Detection {
  const [winner, runnerUp] = finishOrder(plan)
  if (!winner || fromMs >= winner.finishTimeMs) return { events: [], memory }

  if (toMs >= winner.finishTimeMs) {
    const events: CommentaryEvent[] = []
    if (runnerUp && runnerUp.finishTimeMs - winner.finishTimeMs <= PHOTO_FINISH_MARGIN_MS) {
      events.push({
        type: 'photo-finish',
        roundIndex: plan.roundIndex,
        winnerId: winner.horseId,
        runnerUpId: runnerUp.horseId,
        marginMs: runnerUp.finishTimeMs - winner.finishTimeMs,
      })
    }
    events.push({
      type: 'winner',
      roundIndex: plan.roundIndex,
      horseId: winner.horseId,
      finishTimeMs: winner.finishTimeMs,
    })
    return { events, memory }
  }

  const leader = leaderAt(plan, toMs)
  if (!leader) return { events: [], memory }
  const leaderProgress = progressAt(leader, plan.distance, toMs)

  if (!memory.finalStretchCalled && leaderProgress >= FINAL_STRETCH_PROGRESS) {
    return {
      events: [{ type: 'final-stretch', roundIndex: plan.roundIndex, horseId: leader.horseId }],
      memory: {
        ...memory,
        finalStretchCalled: true,
        announcedLeaderId: leader.horseId,
        lastLeadCallMs: toMs,
      },
    }
  }

  const isNewLeader = leader.horseId !== memory.announcedLeaderId
  const hasRestedLongEnough = toMs - memory.lastLeadCallMs >= plan.durationMs * LEAD_CALL_INTERVAL
  if (leaderProgress >= LEAD_CALL_MIN_PROGRESS && isNewLeader && hasRestedLongEnough) {
    return {
      events: [
        {
          type: 'lead-change',
          roundIndex: plan.roundIndex,
          horseId: leader.horseId,
          early: memory.announcedLeaderId === null,
        },
      ],
      memory: { ...memory, announcedLeaderId: leader.horseId, lastLeadCallMs: toMs },
    }
  }

  return { events: [], memory }
}
