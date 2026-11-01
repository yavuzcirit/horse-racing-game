<script setup lang="ts">
import { computed } from 'vue'
import HorseIcon from './HorseIcon.vue'

const { progress, galloping } = defineProps<{
  name: string
  color: string
  lane: number
  progress: number
  galloping: boolean
}>()

const pose = computed(() => (progress > 0 && progress < 1 ? 'running' : 'standing'))
</script>

<template>
  <div
    class="runner"
    data-testid="runner"
    :class="{ 'runner--galloping': galloping }"
    :style="{ '--progress': progress, '--lane': lane }"
    :title="name"
  >
    <div class="runner__horse">
      <HorseIcon :color="color" :pose="pose" :animated="galloping" />
    </div>
  </div>
</template>

<style scoped>
.runner {
  --gallop-duration: 380ms;
  --gallop-delay: calc(var(--lane) * -53ms);

  position: absolute;
  inset: 0 auto 0 0;
  display: flex;
  align-items: center;
  width: var(--horse-size);
  transform: translateX(calc(var(--progress) * (100cqi - var(--horse-size))));
  will-change: transform;
}

.runner__horse {
  width: var(--horse-size);
  height: calc(var(--horse-size) * 0.6);
}

.runner--galloping .runner__horse {
  animation: stride var(--gallop-duration) ease-in-out var(--gallop-delay) infinite;
}

@keyframes stride {
  0%,
  50%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-2px) rotate(-1.5deg);
  }
  75% {
    transform: translateY(0.5px) rotate(1deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .runner--galloping .runner__horse {
    animation: none;
  }
}
</style>
