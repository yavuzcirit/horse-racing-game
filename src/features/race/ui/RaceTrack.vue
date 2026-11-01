<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { formatDistance } from '@/shared/lib/format'
import { HORSES_PER_ROUND } from '../model/constants'
import { useRaceStore } from '../store/useRaceStore'
import RaceLane from './RaceLane.vue'
import type { LaneRunner } from './types'

const { lanes, currentRound, rounds, status, phase } = storeToRefs(useRaceStore())

const laneNumbers = Array.from({ length: HORSES_PER_ROUND }, (_, index) => index + 1)

const runnersByLane = computed(
  () =>
    new Map<number, LaneRunner>(
      lanes.value.map(({ lane, horse, progress, finished }) => [
        lane,
        { name: horse.name, color: horse.color.hex, progress, finished },
      ]),
    ),
)

const isRacing = computed(() => status.value === 'running' && phase.value === 'racing')

const roundLabel = computed(() =>
  currentRound.value
    ? `Round ${currentRound.value.index + 1} · ${formatDistance(currentRound.value.distance)}`
    : 'No program yet',
)

const statusLabel = computed(() => {
  switch (status.value) {
    case 'running':
      return phase.value === 'intermission'
        ? 'Next round is about to start…'
        : `Round ${(currentRound.value?.index ?? 0) + 1} of ${rounds.value.length} is under way.`
    case 'ready':
      return 'Horses are in the gates. Press Start when you are ready.'
    case 'paused':
      return 'Paused.'
    case 'finished':
      return `All ${rounds.value.length} rounds are complete.`
    default:
      return 'Generate a program to fill the gates.'
  }
})
</script>

<template>
  <section class="track" aria-labelledby="track-heading">
    <header class="track__header">
      <h2 id="track-heading" class="track__title">{{ roundLabel }}</h2>
      <p class="track__status" data-testid="race-status">{{ statusLabel }}</p>
    </header>

    <ol class="track__lanes" :aria-label="`Race track, ${roundLabel}`">
      <RaceLane
        v-for="lane in laneNumbers"
        :key="lane"
        :lane="lane"
        :runner="runnersByLane.get(lane) ?? null"
        :galloping="isRacing"
      />
    </ol>

    <footer class="track__footer" aria-hidden="true">
      <span class="track__round">{{ roundLabel }}</span>
      <span class="track__finish">Finish</span>
    </footer>
  </section>
</template>

<style scoped>
.track {
  --gate-width: 34px;
  --lane-height: 46px;
  --horse-size: 62px;

  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.track__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.track__title {
  font-size: var(--text-lg);
  font-weight: 700;
}

.track__status {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.track__lanes {
  display: flex;
  flex-direction: column;
}

.track__footer {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4) var(--space-2) calc(var(--gate-width) + var(--space-3));
  color: var(--color-finish);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 767px) {
  .track {
    --gate-width: 28px;
    --lane-height: 38px;
    --horse-size: 50px;
  }
}
</style>
