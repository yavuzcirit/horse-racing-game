<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import BasePanel from '@/shared/ui/BasePanel.vue'
import { formatDistance } from '@/shared/lib/format'
import { useRaceStore } from '../store/useRaceStore'
import RoundTable from './RoundTable.vue'
import { useRoundEntries } from './useRoundEntries'
import { useRevealLatest } from './useRevealLatest'

const { rounds, currentRoundIndex, status } = storeToRefs(useRaceStore())
const { toEntry } = useRoundEntries()

const panel = useTemplateRef('panel')
const panelBody = computed(() => panel.value?.body)

const tables = computed(() =>
  rounds.value.map((round) => ({
    key: round.index,
    title: `Round ${round.index + 1} · ${formatDistance(round.distance)}`,
    entries: round.horseIds.map((horseId, index) => toEntry(horseId, index + 1)),
    active:
      round.index === currentRoundIndex.value &&
      (status.value === 'running' || status.value === 'paused'),
  })),
)

useRevealLatest(currentRoundIndex, panelBody, '.round-table--active')
</script>

<template>
  <BasePanel ref="panel" title="Program" tone="program">
    <p v-if="tables.length === 0" class="empty-state">
      Press <strong>Generate Program</strong> to draw six rounds of ten horses.
    </p>
    <RoundTable
      v-for="table in tables"
      :key="table.key"
      :title="table.title"
      :entries="table.entries"
      :active="table.active"
      position-label="Lane"
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
