import { CONDITION_MAX, type Horse, type HorseId } from '@/features/horses'
import { randomBetween, type RandomSource } from '@/shared/lib/random'
import type { Checkpoint, HorseRun, RacePlan, Round } from './types'

export interface RaceModel {
  readonly baseSpeed: number
  readonly conditionBonus: number
  readonly formVariance: number
  readonly segmentVariance: number
  readonly segmentLength: number
}

export const DEFAULT_RACE_MODEL: RaceModel = {
  baseSpeed: 15,
  conditionBonus: 3,
  formVariance: 0.03,
  segmentVariance: 0.08,
  segmentLength: 200,
}

export function planRace(
  round: Round,
  horses: ReadonlyMap<HorseId, Horse>,
  random: RandomSource,
  model: RaceModel = DEFAULT_RACE_MODEL,
): RacePlan {
  const runs = round.horseIds.map((horseId, index) => {
    const horse = horses.get(horseId)
    if (!horse) throw new Error(`Horse ${horseId} is not in the stable`)
    return planRun(horse, index + 1, round.distance, random, model)
  })

  return {
    roundIndex: round.index,
    distance: round.distance,
    runs,
    durationMs: Math.max(0, ...runs.map((run) => run.finishTimeMs)),
  }
}

function planRun(
  horse: Horse,
  lane: number,
  distance: number,
  random: RandomSource,
  model: RaceModel,
): HorseRun {
  const cruisingSpeed = model.baseSpeed + model.conditionBonus * (horse.condition / CONDITION_MAX)
  const form = 1 + randomBetween(random, -model.formVariance, model.formVariance)
  const checkpoints: Checkpoint[] = []

  let metres = 0
  let atMs = 0
  while (metres < distance) {
    const length = Math.min(model.segmentLength, distance - metres)
    const surge = 1 + randomBetween(random, -model.segmentVariance, model.segmentVariance)
    atMs += (length / (cruisingSpeed * form * surge)) * 1000
    metres += length
    checkpoints.push({ atMs, metres })
  }

  return { horseId: horse.id, lane, checkpoints, finishTimeMs: atMs }
}
