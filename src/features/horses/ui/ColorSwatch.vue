<script setup lang="ts">
import type { HorseColor } from '../model/types'

defineProps<{
  color: HorseColor
}>()
</script>

<template>
  <span class="swatch">
    <span class="swatch__chip" :style="{ backgroundColor: color.hex }" aria-hidden="true" />
    <span class="swatch__name">{{ color.name }}</span>
  </span>
</template>

<style scoped>
.swatch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
}

.swatch__chip {
  flex: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgb(0 0 0 / 0.35);
}
</style>
