import { motion } from 'motion/react'
import { curveCardinalClosed, lineRadial } from 'd3-shape'
import { EASE } from '../lib/motion'

type A = { label: string; role: number; you: number; proj: number }
const gen = lineRadial<{ a: number; r: number }>().angle((d) => d.a).radius((d) => d.r).curve(curveCardinalClosed.tension(0.5))

export function contourPath(vals: number[], R: number): string {
  return gen(vals.map((v, i) => ({ a: (i * 2 * Math.PI) / vals.length, r: Math.max(0.05, v) * R }))) ?? ''
}

export function Contour({ cx, cy, R, axes }: { cx: number; cy: number; R: number; axes: A[] }) {
  const t = { duration: 0.7, ease: EASE }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {[0.25, 0.5, 0.75].map((f) => (
        <circle key={f} r={R * f} fill="none" stroke="var(--line)" strokeWidth={1} />
      ))}
      {axes.map((a, i) => {
        const ang = (i * 2 * Math.PI) / axes.length
        const s = Math.sin(ang)
        const c = -Math.cos(ang)
        return (
          <g key={a.label}>
            <line x2={s * R} y2={c * R} stroke="var(--line)" strokeWidth={1} />
            <text x={s * (R + 22)} y={c * (R + 22) + 3} textAnchor={s > 0.3 ? 'start' : s < -0.3 ? 'end' : 'middle'} className="svg-mono">{a.label.toUpperCase()}</text>
          </g>
        )
      })}
      <path d={contourPath(axes.map((a) => a.role), R)} fill="none" stroke="var(--ice)" strokeWidth={1.25} />
      <motion.path initial={false} animate={{ d: contourPath(axes.map((a) => a.proj), R) }} transition={{ d: t }} fill="none" stroke="var(--violet)" strokeWidth={1} strokeDasharray="4 4" />
      <motion.path initial={false} animate={{ d: contourPath(axes.map((a) => a.you), R) }} transition={{ d: t }} fill="var(--violet)" fillOpacity={0.18} stroke="var(--violet)" strokeWidth={1.5} />
    </g>
  )
}
