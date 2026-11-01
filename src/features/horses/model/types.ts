export type HorseId = number

export interface HorseColor {
  readonly name: string
  readonly hex: string
}

export interface Horse {
  readonly id: HorseId
  readonly name: string
  readonly condition: number
  readonly color: HorseColor
}
