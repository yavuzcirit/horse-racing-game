import { h, type Component, type Slots } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DataTable from '../data-table/DataTable.vue'
import type { DataTableColumn } from '../data-table/types'

interface Row {
  id: number
  name: string
  score: number
}

const rows: Row[] = [
  { id: 1, name: 'Ada', score: 90 },
  { id: 2, name: 'Grace', score: 85 },
]

const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Name', value: (row) => row.name, rowHeader: true, truncate: true },
  { key: 'score', label: 'Score', value: (row) => row.score, align: 'end', width: '4rem' },
]

function mountTable(props: Record<string, unknown> = {}, slots: Partial<Slots> = {}) {
  const baseProps = { rows, columns, rowKey: (row: Row) => row.id, caption: 'Scores' }
  return mount(() => h(DataTable as Component, { ...baseProps, ...props }, slots))
}

describe('DataTable', () => {
  it('renders a caption, column headers and one row per item', () => {
    const wrapper = mountTable()

    expect(wrapper.get('caption').text()).toBe('Scores')
    expect(wrapper.get('caption').classes()).toContain('visually-hidden')
    expect(wrapper.findAll('thead th').map((th) => th.text())).toEqual(['Name', 'Score'])
    expect(wrapper.findAll('thead th').every((th) => th.attributes('scope') === 'col')).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('marks row header cells for assistive technology', () => {
    const header = mountTable().get('tbody tr th')
    expect(header.attributes('scope')).toBe('row')
    expect(header.text()).toBe('Ada')
    expect(header.classes()).toContain('data-table__cell--truncate')
  })

  it('applies alignment and widths', () => {
    const wrapper = mountTable()
    expect(wrapper.findAll('thead th')[1]?.attributes('style')).toContain('width: 4rem')
    expect(wrapper.get('tbody td').classes()).toContain('data-table__cell--end')
  })

  it('shows a visible caption when asked to', () => {
    expect(mountTable({ captionVisible: true }).get('caption').classes()).not.toContain(
      'visually-hidden',
    )
  })

  it('shows the empty text when there are no rows', () => {
    const wrapper = mountTable({ rows: [], emptyText: 'No scores yet' })
    expect(wrapper.get('.data-table__empty').text()).toBe('No scores yet')
    expect(wrapper.get('.data-table__empty').attributes('colspan')).toBe('2')
  })

  it('lets a slot render a cell', () => {
    const wrapper = mountTable(
      {},
      { 'cell-score': ({ value }: { value: number }) => [h('b', `${value}%`)] },
    )
    expect(wrapper.findAll('tbody b').map((cell) => cell.text())).toEqual(['90%', '85%'])
  })

  it('adds per-row classes', () => {
    const wrapper = mountTable({ rowClass: (row: Row) => ({ 'is-top': row.score > 88 }) })
    expect(wrapper.findAll('tbody tr').map((tr) => tr.classes('is-top'))).toEqual([true, false])
  })
})
