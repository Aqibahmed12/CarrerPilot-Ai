import type { Pt } from '../ui/threadPaths'

export const RING = { cx: 1090, cy: 300, r: 130 }
export const CONTOUR = { cx: 930, cy: 470, r: 230 }
export const MAX_PAN = 830
export const HORIZON = { x: 130, y0: 190, row: 108 }
export const elevX = (i: number) => 130 + i * 350
export const elevY = (v: number) => 770 - 520 * v

export function elevPoints(vals: number[]): Pt[] {
  const v = [...vals]
  while (v.length < 5) v.push(v[v.length - 1] ?? 0)
  return v.slice(0, 5).map((x, i) => [elevX(i), elevY(x)])
}
