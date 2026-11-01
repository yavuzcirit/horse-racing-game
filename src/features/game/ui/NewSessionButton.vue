<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRaceStore } from '@/features/race'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useGameStore } from '../store/useGameStore'

const game = useGameStore()
const { canGenerate } = storeToRefs(useRaceStore())
</script>

<template>
  <BaseButton
    variant="ghost"
    :disabled="!canGenerate"
    title="Bring in twenty new horses and clear the program"
    @click="game.newSession()"
  >
    New horses
  </BaseButton>
</template>
