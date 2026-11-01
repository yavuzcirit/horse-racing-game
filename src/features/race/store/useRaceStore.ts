import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useHorsesStore, type Horse, type HorseId } from '@/features/horses'
import { clamp } from '@/shared/lib/math'
import { createRandom } from '@/shared/lib/random'
import { INTERMISSION_MS, SPEED_OPTIONS, TIME_SCALE, type RaceSpeed } from '../model/constants'
import { createSchedule } from '../model/createSchedule'
import { planRace } from '../model/planRace'
import { createResult, progressAt } from '../model/progress'
import type { RacePhase, RacePlan, RaceStatus, Round, RoundResult } from '../model/types'

export interface RaceMoment {
  readonly status: RaceStatus
  readonly phase: RacePhase
  readonly roundIndex: number
  readonly elapsedMs: number
}

export interface RaceProgress extends RaceMoment {
  readonly intermissionMs: number
  readonly completedRounds: number
  readonly speed: RaceSpeed
}

export interface LaneView {
  readonly lane: number
  readonly horse: Horse
  readonly progress: number
  readonly finished: boolean
}

export const useRaceStore = defineStore('race', () => {
  const horsesStore = useHorsesStore()

  const status = ref<RaceStatus>('idle')
  const phase = ref<RacePhase>('racing')
  const rounds = shallowRef<readonly Round[]>([])
  const plans = shallowRef<readonly RacePlan[]>([])
  const results = shallowRef<readonly RoundResult[]>([])
  const currentRoundIndex = ref(0)
  const elapsedMs = ref(0)
  const intermissionMs = ref(0)
  const speed = ref<RaceSpeed>(1)

  const hasProgram = computed(() => rounds.value.length > 0)
  const currentRound = computed(() => rounds.value[currentRoundIndex.value] ?? null)
  const currentPlan = computed(() => plans.value[currentRoundIndex.value] ?? null)
  const isRunning = computed(() => status.value === 'running')
  const canStart = computed(() => status.value === 'ready' || status.value === 'paused')
  const canGenerate = computed(() => status.value !== 'running')

  const activeHorseIds = computed<ReadonlySet<HorseId>>(() =>
    status.value === 'idle' || status.value === 'finished'
      ? new Set()
      : new Set(currentRound.value?.horseIds ?? []),
  )

  const lanes = computed<LaneView[]>(() => {
    const plan = currentPlan.value
    if (!plan) return []

    return plan.runs.flatMap((run) => {
      const horse = horsesStore.byId.get(run.horseId)
      if (!horse) return []
      return [
        {
          lane: run.lane,
          horse,
          progress: progressAt(run, plan.distance, elapsedMs.value),
          finished: elapsedMs.value >= run.finishTimeMs,
        },
      ]
    })
  })

  function reset() {
    status.value = 'idle'
    phase.value = 'racing'
    rounds.value = []
    plans.value = []
    results.value = []
    currentRoundIndex.value = 0
    elapsedMs.value = 0
    intermissionMs.value = 0
  }

  function generateProgram(seed: number): boolean {
    if (!canGenerate.value) return false

    const horses = horsesStore.byId
    const random = createRandom(seed)
    const schedule = createSchedule([...horses.keys()], random)
    const schedulePlans = schedule.map((round) => planRace(round, horses, random))

    reset()
    rounds.value = schedule
    plans.value = schedulePlans
    status.value = 'ready'
    return true
  }

  function start() {
    if (canStart.value) status.value = 'running'
  }

  function pause() {
    if (status.value === 'running') status.value = 'paused'
  }

  function toggle() {
    if (isRunning.value) pause()
    else start()
  }

  function setSpeed(value: RaceSpeed) {
    if (SPEED_OPTIONS.includes(value)) speed.value = value
  }

  function tick(deltaMs: number) {
    if (status.value !== 'running' || !Number.isFinite(deltaMs) || deltaMs <= 0) return

    const scaledMs = deltaMs * speed.value
    if (phase.value === 'intermission') {
      advanceIntermission(scaledMs)
      return
    }

    const plan = currentPlan.value
    if (!plan) return

    elapsedMs.value = Math.min(elapsedMs.value + scaledMs * TIME_SCALE, plan.durationMs)
    if (elapsedMs.value >= plan.durationMs) completeRound(plan)
  }

  function completeRound(plan: RacePlan) {
    results.value = [...results.value, createResult(plan)]

    if (currentRoundIndex.value >= rounds.value.length - 1) {
      status.value = 'finished'
      return
    }
    phase.value = 'intermission'
    intermissionMs.value = 0
  }

  function advanceIntermission(deltaMs: number) {
    intermissionMs.value += deltaMs
    if (intermissionMs.value < INTERMISSION_MS) return

    currentRoundIndex.value += 1
    elapsedMs.value = 0
    intermissionMs.value = 0
    phase.value = 'racing'
  }

  function captureMoment(): RaceMoment {
    return {
      status: status.value,
      phase: phase.value,
      roundIndex: currentRoundIndex.value,
      elapsedMs: elapsedMs.value,
    }
  }

  function captureProgress(): RaceProgress {
    return {
      ...captureMoment(),
      intermissionMs: intermissionMs.value,
      completedRounds: results.value.length,
      speed: speed.value,
    }
  }

  function restore(progress: RaceProgress): boolean {
    const plan = plans.value[progress.roundIndex]
    if (!plan) return false

    const isLastRound = progress.roundIndex === rounds.value.length - 1
    const roundIsOver = progress.phase === 'intermission' || progress.status === 'finished'
    const expectedCompleted = roundIsOver ? progress.roundIndex + 1 : progress.roundIndex

    if (progress.completedRounds !== expectedCompleted) return false
    if (progress.status === 'finished' && !isLastRound) return false
    if (progress.status === 'idle') return false

    const hasStarted = progress.roundIndex > 0 || progress.elapsedMs > 0 || roundIsOver

    currentRoundIndex.value = progress.roundIndex
    phase.value = progress.phase
    elapsedMs.value = roundIsOver ? plan.durationMs : clamp(progress.elapsedMs, 0, plan.durationMs)
    intermissionMs.value = clamp(progress.intermissionMs, 0, INTERMISSION_MS)
    results.value = plans.value.slice(0, progress.completedRounds).map(createResult)
    speed.value = SPEED_OPTIONS.includes(progress.speed) ? progress.speed : 1

    if (progress.status === 'finished') status.value = 'finished'
    else status.value = hasStarted ? 'paused' : 'ready'

    return true
  }

  return {
    status,
    phase,
    rounds,
    plans,
    results,
    currentRoundIndex,
    elapsedMs,
    intermissionMs,
    speed,
    hasProgram,
    currentRound,
    currentPlan,
    isRunning,
    canStart,
    canGenerate,
    activeHorseIds,
    lanes,
    reset,
    generateProgram,
    start,
    pause,
    toggle,
    setSpeed,
    tick,
    captureMoment,
    captureProgress,
    restore,
  }
})
