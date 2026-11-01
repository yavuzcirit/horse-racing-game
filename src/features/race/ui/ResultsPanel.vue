<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import BasePanel from '@/shared/ui/BasePanel.vue'
import { formatDistance } from '@/shared/lib/format'
import { useRaceStore } from '../store/useRaceStore'
import RoundTable from './RoundTable.vue'
import { useRoundEntries } from './useRoundEntries'
import { useRevealLatest } from './useRevealLatest'

const { results } = storeToRefs(useRaceStore())
const { toEntry } = useRoundEntries()

const panel = useTemplateRef('panel')
const panelBody = computed(() => panel.value?.body)

const tables = computed(() =>
  results.value.map((result) => ({
    key: result.roundIndex,
    title: `Round ${result.roundIndex + 1} · ${formatDistance(result.distance)}`,
    entries: result.placements.map((placement) =>
      toEntry(placement.horseId, placement.position, placement.finishTimeMs),
    ),
  })),
)

useRevealLatest(() => results.value.length, panelBody, '.round-table:last-of-type')
</script>

<template>
  <BasePanel ref="panel" title="Results" tone="results">
    <p v-if="tables.length === 0" class="empty-state">
      Results appear here as each round finishes.
    </p>
    <RoundTable
      v-for="table in tables"
      :key="table.key"
      :title="table.title"
      :entries="table.entries"
      show-time
    />
  </BasePanel>
</template>

<style scoped>
.empty-state {
  padding: var(--space-5) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: center;
}
</style>
