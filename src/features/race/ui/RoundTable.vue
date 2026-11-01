<script setup lang="ts">
import { computed } from 'vue'
import DataTable from '@/shared/ui/data-table/DataTable.vue'
import type { DataTableColumn } from '@/shared/ui/data-table/types'
import { formatRaceTime } from '@/shared/lib/format'
import type { RoundTableEntry } from './types'

const { positionLabel = 'Pos', showTime = false } = defineProps<{
  title: string
  entries: readonly RoundTableEntry[]
  positionLabel?: string
  showTime?: boolean
  active?: boolean
}>()

const columns = computed(() => {
  const base: DataTableColumn<RoundTableEntry>[] = [
    {
      key: 'position',
      label: positionLabel,
      value: (entry) => entry.position,
      align: 'end',
      width: '2.75rem',
    },
    {
      key: 'name',
      label: 'Name',
      value: (entry) => entry.name,
      rowHeader: true,
      truncate: true,
    },
  ]
  if (showTime) {
    base.push({
      key: 'time',
      label: 'Time',
      value: (entry) =>
        entry.finishTimeMs === undefined ? '–' : formatRaceTime(entry.finishTimeMs),
      align: 'end',
      width: '4.5rem',
    })
  }
  return base
})
</script>

<template>
  <div class="round-table" :class="{ 'round-table--active': active }">
    <DataTable
      :rows="entries"
      :columns="columns"
      :row-key="(entry) => entry.horseId"
      :caption="title"
      caption-visible
    >
      <template #cell-name="{ row }">
        <span class="round-table__name" :title="row.name">
          <span
            class="round-table__chip"
            :style="{ backgroundColor: row.color }"
            aria-hidden="true"
          />
          <span class="round-table__label">{{ row.name }}</span>
        </span>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.round-table + .round-table {
  border-top: 1px solid var(--color-border);
}

.round-table :deep(caption) {
  background: var(--color-brand-soft);
  color: var(--color-brand-strong);
}

.round-table--active :deep(caption) {
  background: var(--color-brand);
  color: #fff;
}

.round-table :deep(thead th) {
  position: static;
}

.round-table__name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.round-table__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.round-table__chip {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgb(0 0 0 / 0.35);
}
</style>
