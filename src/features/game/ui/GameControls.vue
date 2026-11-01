<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SPEED_OPTIONS, useRaceStore } from '@/features/race'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useGameStore } from '../store/useGameStore'

const game = useGameStore()
const race = useRaceStore()
const { canGenerate, canStart, isRunning, status, speed } = storeToRefs(race)

const toggleLabel = computed(() => {
  if (isRunning.value) return 'Pause'
  return status.value === 'paused' ? 'Resume' : 'Start'
})
</script>

<template>
  <div class="controls">
    <BaseButton :disabled="!canGenerate" @click="game.generateProgram()">
      Generate Program
    </BaseButton>
    <BaseButton variant="primary" :disabled="!canStart && !isRunning" @click="race.toggle()">
      {{ toggleLabel }}
    </BaseButton>

    <fieldset class="speed">
      <legend class="speed__legend">Speed</legend>
      <div class="speed__options">
        <label v-for="option in SPEED_OPTIONS" :key="option" class="speed__option">
          <input
            class="speed__input"
            type="radio"
            name="race-speed"
            :value="option"
            :checked="speed === option"
            @change="race.setSpeed(option)"
          />
          <span class="speed__label">{{ option }}×</span>
        </label>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2) var(--space-3);
}

.speed {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}

.speed__legend {
  float: left;
  padding: 0;
  color: rgb(255 255 255 / 0.85);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.speed__options {
  display: inline-flex;
  border: 1px solid rgb(255 255 255 / 0.65);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.speed__option {
  position: relative;
  cursor: pointer;
}

.speed__input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.speed__label {
  display: grid;
  place-items: center;
  min-width: 40px;
  height: 38px;
  padding: 0 var(--space-2);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
}

.speed__option + .speed__option .speed__label {
  border-left: 1px solid rgb(255 255 255 / 0.4);
}

.speed__input:checked + .speed__label {
  background: #fff;
  color: var(--color-brand-strong);
}

.speed__input:focus-visible + .speed__label {
  outline: 3px solid #fff;
  outline-offset: -3px;
}
</style>
