import { clamp } from '@/shared/lib/math'
import type { HorseRun, Placement, RacePlan, RoundResult } from './types'

export function distanceAt(run: HorseRun, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0

  let previousAt = 0
  let previousMetres = 0
  for (const checkpoint of run.checkpoints) {
    if (elapsedMs < checkpoint.atMs) {
      const segmentShare = (elapsedMs - previousAt) / (checkpoint.atMs - previousAt)
      return previousMetres + segmentShare * (checkpoint.metres - previousMetres)
    }
    previousAt = checkpoint.atMs
    previousMetres = checkpoint.metres
  }
  return previousMetres
}

export function progressAt(run: HorseRun, distance: number, elapsedMs: number): number {
  return distance > 0 ? clamp(distanceAt(run, elapsedMs) / distance, 0, 1) : 0
}

export function standingsAt(plan: RacePlan, elapsedMs: number): HorseRun[] {
  return [...plan.runs].sort((a, b) => {
    const gap = distanceAt(b, elapsedMs) - distanceAt(a, elapsedMs)
    return gap !== 0 ? gap : a.finishTimeMs - b.finishTimeMs || a.lane - b.lane
  })
}

export function leaderAt(plan: RacePlan, elapsedMs: number): HorseRun | null {
  return standingsAt(plan, elapsedMs)[0] ?? null
}

export function finishOrder(plan: RacePlan): HorseRun[] {
  return [...plan.runs].sort((a, b) => a.finishTimeMs - b.finishTimeMs || a.lane - b.lane)
}

export function createResult(plan: RacePlan): RoundResult {
  const placements: Placement[] = finishOrder(plan).map((run, index) => ({
    position: index + 1,
    horseId: run.horseId,
    lane: run.lane,
    finishTimeMs: run.finishTimeMs,
  }))
  return { roundIndex: plan.roundIndex, distance: plan.distance, placements }
}
