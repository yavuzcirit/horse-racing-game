export type CellValue = string | number

export interface DataTableColumn<Row> {
  readonly key: string
  readonly label: string
  readonly value: (row: Row) => CellValue
  readonly align?: 'start' | 'center' | 'end'
  readonly width?: string
  readonly rowHeader?: boolean
  readonly truncate?: boolean
}
