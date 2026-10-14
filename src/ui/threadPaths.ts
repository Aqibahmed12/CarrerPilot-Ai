export type Pt = [number, number]
export type ThreadPreset = { d: string; x: number; y: number }
const f = (n: number) => Math.round(n * 10) / 10

// Every preset is `M` + four `C` so motion can interpolate `d` between any two stages.
export function smooth(pts: Pt[]): ThreadPreset {
  const P = [...pts]
  while (P.length < 5) P.push(P[P.length - 1])
  let d = `M ${f(P[0][0])} ${f(P[0][1])}`
  for (let i = 0; i < 4; i++) {
    const p0 = P[Math.max(0, i - 1)]
    const p1 = P[i]
    const p2 = P[i + 1]
    const p3 = P[Math.min(4, i + 2)]
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return { d, x: P[4][0], y: P[4][1] }
}

export function arc(cx: number, cy: number, r: number, a0: number, sweep: number): ThreadPreset {
  const seg = (sweep / 4) * (Math.PI / 180)
  const k = (4 / 3) * Math.tan(seg / 4) * r
  const at = (a: number): Pt => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const start = (a0 * Math.PI) / 180
  const s = at(start)
  let d = `M ${f(s[0])} ${f(s[1])}`
  let end = s
  for (let i = 0; i < 4; i++) {
    const a = start + i * seg
    const b = a + seg
    const p = at(a)
    end = at(b)
    d += ` C ${f(p[0] - k * Math.sin(a))} ${f(p[1] + k * Math.cos(a))} ${f(end[0] + k * Math.sin(b))} ${f(end[1] - k * Math.cos(b))} ${f(end[0])} ${f(end[1])}`
  }
  return { d, x: f(end[0]), y: f(end[1]) }
}

export function hline(x0: number, x1: number, y: number): ThreadPreset {
  const n = 4
  return smooth(Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y] as Pt))
}

export const PROLOGUE = smooth([[720, 900], [705, 720], [740, 540], [860, 370], [1100, 190]])
export const ORIGIN = smooth([[86, 60], [86, 230], [86, 400], [86, 570], [86, 700]])
