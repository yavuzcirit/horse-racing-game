<script setup lang="ts" generic="Row">
import type { CellValue, DataTableColumn } from './types'

const { captionVisible = false, emptyText = 'Nothing to show yet.' } = defineProps<{
  rows: readonly Row[]
  columns: readonly DataTableColumn<Row>[]
  rowKey: (row: Row) => string | number
  caption: string
  captionVisible?: boolean
  emptyText?: string
  rowClass?: (row: Row) => string | Record<string, boolean> | undefined
}>()

defineSlots<{
  [K in `cell-${string}`]?: (props: { row: Row; value: CellValue }) => unknown
}>()
</script>

<template>
  <table class="data-table">
    <caption class="data-table__caption" :class="{ 'visually-hidden': !captionVisible }">
      {{
        caption
      }}
    </caption>
    <thead>
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          scope="col"
          :class="`data-table__cell--${column.align ?? 'start'}`"
          :style="column.width ? { width: column.width } : undefined"
        >
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="rowKey(row)" :class="rowClass?.(row)">
        <component
          :is="column.rowHeader ? 'th' : 'td'"
          v-for="column in columns"
          :key="column.key"
          :scope="column.rowHeader ? 'row' : undefined"
          :class="[
            `data-table__cell--${column.align ?? 'start'}`,
            { 'data-table__cell--truncate': column.truncate },
          ]"
        >
          <slot :name="`cell-${column.key}`" :row="row" :value="column.value(row)">
            {{ column.value(row) }}
          </slot>
        </component>
      </tr>
      <tr v-if="rows.length === 0">
        <td class="data-table__empty" :colspan="columns.length">{{ emptyText }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.data-table__caption {
  padding: var(--space-2) var(--space-3);
  text-align: left;
  font-weight: 700;
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

th,
td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: middle;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}

tbody th {
  font-weight: 500;
}

tbody tr:last-child > * {
  border-bottom: 0;
}

.data-table__cell--center {
  text-align: center;
}

.data-table__cell--end {
  text-align: right;
}

.data-table__cell--truncate {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table__empty {
  padding: var(--space-4) var(--space-3);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
