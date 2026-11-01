<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useHorsesStore } from '@/features/horses'
import BasePanel from '@/shared/ui/BasePanel.vue'
import { formatEvent } from '../model/formatEvent'
import type { CommentaryEvent } from '../model/types'
import { useCommentaryStore } from '../store/useCommentaryStore'

type Tone = 'start' | 'lead' | 'finish' | 'info'

const TONES: Record<CommentaryEvent['type'], Tone> = {
  'round-start': 'start',
  'lead-change': 'lead',
  'final-stretch': 'lead',
  'photo-finish': 'finish',
  winner: 'finish',
  'program-complete': 'info',
}

const { entries } = storeToRefs(useCommentaryStore())
const horsesStore = useHorsesStore()

const lines = computed(() =>
  entries.value
    .map((entry) => ({
      id: entry.id,
      tone: TONES[entry.event.type],
      round: 'roundIndex' in entry.event ? entry.event.roundIndex + 1 : null,
      text: formatEvent(entry.event, horsesStore.nameOf, entry.id),
    }))
    .reverse(),
)
</script>

<template>
  <BasePanel title="Commentary" class="commentary">
    <ol
      class="commentary__feed"
      aria-label="Live race commentary, newest first"
      aria-live="polite"
      aria-relevant="additions"
    >
      <li
        v-for="line in lines"
        :key="line.id"
        class="commentary__line"
        :class="`commentary__line--${line.tone}`"
      >
        <span v-if="line.round" class="commentary__round" :aria-label="`Round ${line.round}`">
          R{{ line.round }}
        </span>
        <span class="commentary__text">{{ line.text }}</span>
      </li>
    </ol>
    <p v-if="lines.length === 0" class="commentary__empty">
      Commentary starts when the first round is under way.
    </p>
  </BasePanel>
</template>

<style scoped>
.commentary__feed {
  display: flex;
  flex-direction: column;
}

.commentary__line {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  padding: 7px var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
}

.commentary__line:first-child {
  animation: arrive 220ms ease-out;
}

.commentary__round {
  flex: none;
  min-width: 2.25rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--color-tone-neutral-soft);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
  text-align: center;
}

.commentary__line--start .commentary__round {
  background: var(--color-tone-program-soft);
  color: var(--color-tone-program);
}

.commentary__line--finish .commentary__text {
  font-weight: 700;
}

.commentary__line--finish .commentary__round {
  background: var(--color-tone-results-soft);
  color: var(--color-tone-results);
}

.commentary__line--info {
  background: var(--color-tone-horses-soft);
  font-weight: 600;
}

.commentary__empty {
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: center;
}

@keyframes arrive {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}
</style>
