<script setup lang="ts">
import { computed } from 'vue'
import { HORSE_POSES, type HorsePose } from './horsePoses'

const {
  color,
  pose = 'standing',
  animated = false,
} = defineProps<{
  color: string
  pose?: HorsePose
  animated?: boolean
}>()

const frames = computed(() => HORSE_POSES[pose])
</script>

<template>
  <svg
    class="horse-icon"
    :class="{ 'horse-icon--animated': animated && frames.length > 1 }"
    :style="{ '--coat': color }"
    viewBox="0 0 120 72"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse class="horse-icon__shadow" cx="58" cy="69.8" rx="36" ry="2.1" />

    <path class="horse-icon__ear horse-icon__ear--far" d="M93 5.8 L93.4 0.6 L95.8 4.6 Z" />

    <g
      v-for="(frame, index) in frames"
      :key="`far-${index}`"
      class="horse-icon__frame"
      :class="`horse-icon__frame--${index}`"
    >
      <template v-for="(limb, part) in frame.far" :key="part">
        <path class="horse-icon__leg horse-icon__leg--far" :d="limb.leg" />
        <path class="horse-icon__hoof" :d="limb.hoof" />
      </template>
    </g>

    <path
      class="horse-icon__tail"
      d="M31.8 22.6 C26 21.4 20 22.6 14.6 25.6 C10.8 27.8 6.4 29.6 2 30.2 C6 31.6 10.6 31.6 14.4 30.4
         C11.6 33 8.2 35.6 4.2 37.2 C10 37.6 16.4 35 21 31.6 C24.4 29.4 27.2 27.8 29.4 27.4 Z"
    />

    <g
      v-for="(frame, index) in frames"
      :key="`near-${index}`"
      class="horse-icon__frame"
      :class="`horse-icon__frame--${index}`"
    >
      <template v-for="(limb, part) in frame.near" :key="part">
        <path class="horse-icon__leg" :d="limb.leg" />
        <path class="horse-icon__hoof" :d="limb.hoof" />
      </template>
    </g>

    <path
      class="horse-icon__coat"
      d="M31 22 C34 19.6 37.5 18.8 41 19.2 C46 19.8 50 22.4 56 22.8 C61 23.2 66 21.8 70 19.6
         C76 15.6 84 9.6 91 6.4 C92.4 5.8 93.4 5.5 94.2 5.4 L95.4 0.2 C96.4 1.6 97.2 3 97.6 4.6
         C101 5.8 106 9 110.6 12.2 C112.8 13.6 114.6 14.8 115.8 16.2 C116.8 17.4 116.6 19 115.4 19.8
         C114.6 20.3 113.6 20.4 112.8 20.5 C112.6 21.4 111.8 22 110.6 21.9 C108 21.6 105.6 21 103.4 20
         C101 19 99.6 17.6 99 15.6 C94.5 17.6 90 22 86.6 26.6 C84.6 29.2 83 31 81.8 33.4
         C81.2 36.6 80 39.6 77.8 41.6 C75.6 43.2 72 43.8 68 43.6 C61 43.4 54 41.6 47.6 37.6
         C44 38.8 40 40.6 35.4 41.2 C31.4 40.4 29.6 38.6 28.6 35.2 C27.6 31.6 27.6 25 31 22 Z"
    />

    <path
      class="horse-icon__shade"
      d="M47.6 37.6 C54 41.6 61 43.4 68 43.6 C72 43.8 75.6 43.2 77.8 41.6 C80 39.6 81.2 36.6 81.8 33.4
         C79.2 37.6 74 40.6 67 41 C59.6 41.4 53 40 47.6 37.6 Z"
    />
    <g class="horse-icon__contours">
      <path d="M69.6 21.6 C72.6 27 76.4 32 81 34.4" />
      <path d="M43 23 C45.4 27 46 31 45.2 34.6" />
      <path d="M97.4 14.4 C93 16.6 89 20.4 85.8 25.8" />
      <path d="M99.6 15.2 C101.4 12.4 105.4 12.4 106.8 16.4" />
    </g>
    <g class="horse-icon__highlights">
      <path d="M34 21.2 C38.6 19.6 44 19.8 49 21.6" />
      <path d="M72.6 18.2 C78.6 13.4 85 9.2 91.6 6.6" />
      <path d="M101 7.2 C105 8.8 109 11.4 112.6 14" />
    </g>

    <path
      class="horse-icon__cloth"
      d="M55.4 23.4 C58 23.6 61 23.2 63.6 22.2 L64.6 28.2 C61.6 29.2 58.4 29.4 55.6 29 Z"
    />
    <path
      class="horse-icon__saddle"
      d="M55.4 23.2 C58.4 22.2 61.6 21.6 64.2 21.2 C63.8 23.2 62 24.4 59.6 24.6 C57.8 24.8 56.2 24.4 55.4 23.2 Z"
    />
    <path class="horse-icon__strap" d="M63.4 28.4 C65.4 33.4 67.4 38.6 69.4 43.6" />

    <path
      class="horse-icon__mane"
      d="M94 5.6 C90.4 5.8 87 7 83.6 8.8 L83.4 6.4 C81.4 8.2 79.6 9.8 77.8 11.4 L76.8 9.2
         C75.2 11.4 73.6 13.4 71.8 15.2 L69.8 14.2 C69.4 16.2 68.8 18.2 67.8 20.4
         C70.4 20 73 18.4 75.6 16.4 C81 12.4 87 8.6 94 6.8 Z"
    />
    <path
      class="horse-icon__mane"
      d="M96.6 4.6 C98.4 5.4 99.8 6.8 100.4 8.6 C98.6 8.2 97.2 6.8 96.6 4.6 Z"
    />

    <g class="horse-icon__tack">
      <path d="M97.2 5.4 L112.4 19.8" />
      <path d="M109.6 11.9 C109.6 15.2 109.9 18.6 110.4 21.7" />
      <path d="M112.6 20 C100 21 86 21.2 72 18.6" />
    </g>

    <ellipse class="horse-icon__eye" cx="103.2" cy="9.8" rx="1.3" ry="1.05" />
    <circle class="horse-icon__glint" cx="102.8" cy="9.4" r="0.35" />
    <ellipse
      class="horse-icon__nostril"
      cx="114"
      cy="16"
      rx="0.95"
      ry="0.6"
      transform="rotate(40 114 16)"
    />
    <path class="horse-icon__mouth" d="M115.6 19.6 C114.6 20 113.6 20.2 112.8 20.3" />
  </svg>
</template>

<style scoped>
.horse-icon {
  --outline: var(--color-horse-outline);
  --hair: color-mix(in oklab, var(--coat) 40%, #000);
  --far-coat: color-mix(in oklab, var(--coat) 68%, #000);

  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.horse-icon__shadow {
  fill: rgb(0 0 0 / 0.2);
}

.horse-icon__coat,
.horse-icon__leg,
.horse-icon__tail,
.horse-icon__ear,
.horse-icon__hoof {
  stroke: var(--outline);
  stroke-width: 1.2;
  stroke-linejoin: round;
}

.horse-icon__coat,
.horse-icon__leg {
  fill: var(--coat);
}

.horse-icon__leg--far,
.horse-icon__ear--far {
  fill: var(--far-coat);
}

.horse-icon__tail,
.horse-icon__mane {
  fill: var(--hair);
}

.horse-icon__hoof {
  fill: #2b2420;
}

.horse-icon__shade {
  fill: rgb(0 0 0 / 0.16);
}

.horse-icon__contours,
.horse-icon__highlights,
.horse-icon__tack,
.horse-icon__strap {
  fill: none;
  stroke-linecap: round;
}

.horse-icon__contours {
  stroke: rgb(0 0 0 / 0.22);
  stroke-width: 0.9;
}

.horse-icon__highlights {
  stroke: color-mix(in oklab, var(--coat) 45%, #fff);
  stroke-width: 1.2;
  opacity: 0.75;
}

.horse-icon__cloth {
  fill: #f5f2ea;
  stroke: var(--outline);
  stroke-width: 0.8;
  stroke-linejoin: round;
}

.horse-icon__saddle {
  fill: #3b2a20;
}

.horse-icon__strap {
  stroke: #3b2a20;
  stroke-width: 1.4;
}

.horse-icon__tack {
  stroke: #2b2420;
  stroke-width: 0.8;
}

.horse-icon__eye,
.horse-icon__nostril {
  fill: #1a1512;
}

.horse-icon__glint {
  fill: #fff;
}

.horse-icon__mouth {
  fill: none;
  stroke: #1a1512;
  stroke-width: 0.7;
  stroke-linecap: round;
}

.horse-icon__frame--1 {
  opacity: 0;
}

.horse-icon--animated .horse-icon__frame--0,
.horse-icon--animated .horse-icon__frame--1 {
  animation-duration: var(--gallop-duration, 380ms);
  animation-delay: var(--gallop-delay, 0ms);
  animation-timing-function: steps(1, end);
  animation-iteration-count: infinite;
}

.horse-icon--animated .horse-icon__frame--0 {
  animation-name: first-frame;
}

.horse-icon--animated .horse-icon__frame--1 {
  animation-name: second-frame;
}

@keyframes first-frame {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes second-frame {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .horse-icon--animated .horse-icon__frame--0,
  .horse-icon--animated .horse-icon__frame--1 {
    animation: none;
  }
}
</style>
