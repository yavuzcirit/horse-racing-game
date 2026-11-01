<script setup lang="ts">
import HorseRunner from './HorseRunner.vue'
import type { LaneRunner } from './types'

defineProps<{
  lane: number
  runner: LaneRunner | null
  galloping: boolean
}>()
</script>

<template>
  <li class="lane">
    <span class="lane__gate" aria-hidden="true">{{ lane }}</span>
    <div class="lane__run">
      <template v-if="runner">
        <span class="lane__name" aria-hidden="true">{{ runner.name }}</span>
        <HorseRunner
          :name="runner.name"
          :color="runner.color"
          :lane="lane"
          :progress="runner.progress"
          :galloping="galloping && !runner.finished"
        />
      </template>
    </div>
    <span class="visually-hidden">
      Lane {{ lane }}: {{ runner?.name ?? 'empty' }}{{ runner?.finished ? ', finished' : '' }}
    </span>
  </li>
</template>

<style scoped>
.lane {
  display: grid;
  grid-template-columns: var(--gate-width) minmax(0, 1fr);
  height: var(--lane-height);
}

.lane:nth-child(even) .lane__run {
  background-color: var(--color-turf-alt);
}

.lane + .lane .lane__run {
  border-top: 2px dashed var(--color-turf-line);
}

.lane__gate {
  display: grid;
  place-items: center;
  background: var(--color-gate);
  color: #fff;
  font-weight: 700;
  font-size: var(--text-sm);
  border-bottom: 1px solid rgb(255 255 255 / 0.25);
}

.lane__run {
  position: relative;
  container-type: inline-size;
  background-color: var(--color-turf);
}

.lane__run::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  width: 8px;
  background: repeating-conic-gradient(#fff 0 25%, var(--color-finish) 0 50%) 0 0 / 8px 8px;
  opacity: 0.9;
}

.lane__name {
  position: absolute;
  inset: 0 auto 0 calc(var(--horse-size) + var(--space-2));
  display: flex;
  align-items: center;
  max-width: 45%;
  overflow: hidden;
  color: rgb(255 255 255 / 0.85);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 1px rgb(0 0 0 / 0.35);
  pointer-events: none;
}
</style>
