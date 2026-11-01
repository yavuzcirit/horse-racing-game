type Point = readonly [x: number, y: number]

type LegJoints = readonly [Point, Point, Point, Point, Point, Point]

export interface LegShape {
  readonly leg: string
  readonly hoof: string
}

export interface PoseFrame {
  readonly far: readonly LegShape[]
  readonly near: readonly LegShape[]
}

export type HorsePose = 'standing' | 'running'

const FORELEG_WIDTHS = [10, 7.2, 4.6, 4.2, 3.4] as const
const HINDLEG_WIDTHS = [14, 7.6, 4.8, 4.2, 3.4] as const
const HOOF_WIDTHS = [3.4, 4.6] as const

const round = (value: number) => Math.round(value * 100) / 100
const format = ([x, y]: Point) => `${round(x)} ${round(y)}`

function normalAt(points: readonly Point[], index: number): Point {
  const before = points[Math.max(0, index - 1)] as Point
  const after = points[Math.min(points.length - 1, index + 1)] as Point
  const dx = after[0] - before[0]
  const dy = after[1] - before[1]
  const length = Math.hypot(dx, dy) || 1
  return [-dy / length, dx / length]
}

function offset(point: Point, normal: Point, distance: number): Point {
  return [point[0] + normal[0] * distance, point[1] + normal[1] * distance]
}

function curveThrough(points: readonly Point[]): string {
  let path = ''
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)] as Point
    const p1 = points[i] as Point
    const p2 = points[i + 1] as Point
    const p3 = points[Math.min(points.length - 1, i + 2)] as Point
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    path += ` C ${format(c1)} ${format(c2)} ${format(p2)}`
  }
  return path
}

function shapeLeg(joints: LegJoints, widths: readonly number[]): LegShape {
  const limb = joints.slice(0, 5)
  const side = (direction: 1 | -1) =>
    limb.map((point, i) => offset(point, normalAt(limb, i), (direction * (widths[i] ?? 3)) / 2))
  const front = side(1)
  const back = side(-1).reverse()

  const [, , , , coronet, toe] = joints
  const hoofNormal = normalAt([coronet, toe], 0)
  const hoof = [
    offset(coronet, hoofNormal, HOOF_WIDTHS[0] / 2),
    offset(toe, hoofNormal, HOOF_WIDTHS[1] / 2),
    offset(toe, hoofNormal, -HOOF_WIDTHS[1] / 2),
    offset(coronet, hoofNormal, -HOOF_WIDTHS[0] / 2),
  ]

  return {
    leg: `M ${format(front[0] as Point)}${curveThrough(front)} L ${format(back[0] as Point)}${curveThrough(back)} Z`,
    hoof: `M ${hoof.map(format).join(' L ')} Z`,
  }
}

function frame(legs: {
  farFore: LegJoints
  farHind: LegJoints
  nearFore: LegJoints
  nearHind: LegJoints
}): PoseFrame {
  return {
    far: [shapeLeg(legs.farHind, HINDLEG_WIDTHS), shapeLeg(legs.farFore, FORELEG_WIDTHS)],
    near: [shapeLeg(legs.nearHind, HINDLEG_WIDTHS), shapeLeg(legs.nearFore, FORELEG_WIDTHS)],
  }
}

const STANDING = frame({
  farFore: [
    [73.4, 37],
    [73.8, 44],
    [73.6, 54],
    [73.6, 63.2],
    [75, 66.2],
    [75.8, 69.6],
  ],
  farHind: [
    [42, 34],
    [40.4, 45.4],
    [38.6, 52.4],
    [39.4, 63.2],
    [40.8, 66.2],
    [41.6, 69.6],
  ],
  nearFore: [
    [76, 37],
    [77.6, 44],
    [78, 54],
    [78.4, 63.2],
    [80, 66.2],
    [80.8, 69.6],
  ],
  nearHind: [
    [38, 33],
    [36, 45],
    [33.8, 52],
    [34.4, 63.2],
    [35.8, 66.2],
    [36.6, 69.6],
  ],
})

const EXTENDED = frame({
  farFore: [
    [73.4, 37],
    [77, 44.6],
    [83.4, 53],
    [88.6, 60.6],
    [90.6, 63.4],
    [93, 65.8],
  ],
  farHind: [
    [42, 34],
    [38.4, 44],
    [32.6, 52],
    [24.6, 61],
    [22, 63.8],
    [19.2, 66.2],
  ],
  nearFore: [
    [76, 37],
    [81, 44],
    [89.6, 50],
    [98.4, 54.2],
    [101.4, 56.2],
    [104.6, 57.4],
  ],
  nearHind: [
    [38, 33],
    [33, 42.6],
    [26.6, 49.6],
    [15.4, 56],
    [12, 57.2],
    [8.4, 58],
  ],
})

const GATHERED = frame({
  farFore: [
    [73.4, 37],
    [74.6, 44.4],
    [75, 54],
    [73, 63.2],
    [74.4, 66.4],
    [75.6, 69.6],
  ],
  farHind: [
    [42, 34],
    [41.2, 44.4],
    [38.4, 51.8],
    [41.4, 63],
    [43, 66.2],
    [44.4, 69.4],
  ],
  nearFore: [
    [76, 37],
    [80.4, 44],
    [85.4, 51],
    [80.2, 57.4],
    [77.4, 58.8],
    [74.6, 60],
  ],
  nearHind: [
    [38, 33],
    [36.4, 43.4],
    [33.4, 50.6],
    [43.4, 59],
    [46.4, 61.2],
    [49.8, 62.4],
  ],
})

export const HORSE_POSES: Readonly<Record<HorsePose, readonly PoseFrame[]>> = {
  standing: [STANDING],
  running: [EXTENDED, GATHERED],
}
