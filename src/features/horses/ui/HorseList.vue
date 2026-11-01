<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BasePanel from '@/shared/ui/BasePanel.vue'
import DataTable from '@/shared/ui/data-table/DataTable.vue'
import type { DataTableColumn } from '@/shared/ui/data-table/types'
import { CONDITION_MAX, HORSE_COUNT } from '../model/constants'
import type { Horse, HorseId } from '../model/types'
import { useHorsesStore } from '../store/useHorsesStore'
import ColorSwatch from './ColorSwatch.vue'

const { activeHorseIds = new Set<HorseId>() } = defineProps<{
  activeHorseIds?: ReadonlySet<HorseId>
}>()

defineSlots<{
  actions?(): unknown
}>()

const { horses } = storeToRefs(useHorsesStore())

const columns: readonly DataTableColumn<Horse>[] = [
  { key: 'id', label: '#', value: (horse) => horse.id, align: 'end', width: '2.25rem' },
  { key: 'name', label: 'Name', value: (horse) => horse.name, rowHeader: true, truncate: true },
  { key: 'condition', label: 'Condition', value: (horse) => horse.condition, width: '5.75rem' },
  { key: 'color', label: 'Color', value: (horse) => horse.color.name, width: '7.75rem' },
]

function rowClass(horse: Horse) {
  return { 'horse-list__row--active': activeHorseIds.has(horse.id) }
}
</script>

<template>
  <BasePanel :title="`Horse List (1–${HORSE_COUNT})`" tone="horses">
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>

    <DataTable
      :rows="horses"
      :columns="columns"
      :row-key="(horse) => horse.id"
      :row-class="rowClass"
      caption="All horses with their condition and colour"
      empty-text="No horses yet."
    >
      <template #cell-name="{ row }">
        <span :title="row.name">{{ row.name }}</span>
      </template>
      <template #cell-condition="{ row }">
        <span class="condition">
          <span class="condition__value">{{ row.condition }}</span>
          <span class="condition__track" aria-hidden="true">
            <span
              class="condition__fill"
              :style="{ width: `${(row.condition / CONDITION_MAX) * 100}%` }"
            />
          </span>
        </span>
      </template>
      <template #cell-color="{ row }">
        <ColorSwatch :color="row.color" />
      </template>
    </DataTable>
  </BasePanel>
</template>

<style scoped>
.condition {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.condition__value {
  min-width: 1.5rem;
  text-align: right;
}

.condition__track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  overflow: hidden;
}

.condition__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-tone-horses);
}

:deep(.horse-list__row--active) {
  background: var(--color-tone-horses-soft);
}

:deep(.horse-list__row--active > th) {
  font-weight: 700;
}
</style>
