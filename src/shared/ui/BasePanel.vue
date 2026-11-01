<script setup lang="ts">
import { useId, useTemplateRef } from 'vue'
import type { PanelTone } from './types'

const { tone = 'neutral', headingLevel = 2 } = defineProps<{
  title: string
  tone?: PanelTone
  headingLevel?: 2 | 3
  subtitle?: string
}>()

defineSlots<{
  default(): unknown
  actions?(): unknown
}>()

const headingId = useId()
const body = useTemplateRef<HTMLElement>('body')

defineExpose({ body })
</script>

<template>
  <section class="panel" :class="`panel--${tone}`" :aria-labelledby="headingId">
    <header class="panel__header">
      <div class="panel__heading">
        <component :is="`h${headingLevel}`" :id="headingId" class="panel__title">
          {{ title }}
        </component>
        <p v-if="subtitle" class="panel__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="panel__actions">
        <slot name="actions" />
      </div>
    </header>
    <div ref="body" class="panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  --panel-accent: var(--color-tone-neutral);
  --panel-accent-soft: var(--color-tone-neutral-soft);

  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--panel-accent);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.panel--horses {
  --panel-accent: var(--color-tone-horses);
  --panel-accent-soft: var(--color-tone-horses-soft);
}

.panel--program {
  --panel-accent: var(--color-tone-program);
  --panel-accent-soft: var(--color-tone-program-soft);
}

.panel--results {
  --panel-accent: var(--color-tone-results);
  --panel-accent-soft: var(--color-tone-results-soft);
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--panel-accent-soft);
  border-bottom: 1px solid var(--color-border);
}

.panel__title {
  font-size: var(--text-md);
  font-weight: 700;
  line-height: 1.2;
}

.panel__subtitle {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.panel__actions {
  display: flex;
  gap: var(--space-2);
}

.panel__body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
</style>
