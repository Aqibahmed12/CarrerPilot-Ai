import { motion } from 'motion/react'
import { EASE } from '../lib/motion'

export type Waypoint = { x: number; y: number; value: number; label: string; sub: string }

export function ElevationLine({ points, sel, onSelect, pan }: { points: Waypoint[]; sel: number | null; onSelect: (i: number) => void; pan: number }) {
  const last = points[points.length - 1]
  return (
    <motion.g initial={{ x: 0 }} animate={{ x: -pan }} transition={{ duration: 0.3, ease: EASE }}>
      <line x1={points[0].x} y1={790} x2={last.x} y2={790} stroke="var(--line-strong)" strokeWidth={1} />
      {points.map((p, i) => {
        const on = sel === i - 1 && i > 0
        return (
          <g
            key={i}
            tabIndex={i > 0 ? 0 : -1}
            role={i > 0 ? 'button' : undefined}
            aria-label={`${p.label}: ${Math.round(p.value * 100)} percent ready. ${p.sub}`}
            style={{ pointerEvents: 'auto', cursor: i > 0 ? 'pointer' : 'default', outline: 'none' }}
            onClick={() => i > 0 && onSelect(i - 1)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && i > 0 && onSelect(i - 1)}
          >
            <line x1={p.x} y1={p.y + 8} x2={p.x} y2={790} stroke="var(--line)" strokeWidth={1} />
            <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={on ? 7 : 6} fill={on || i === 0 ? 'var(--violet)' : 'var(--bg)'} stroke="var(--violet)" strokeWidth={1.5} />
            <text x={p.x} y={p.y - 22} textAnchor="middle" fill="var(--text)" fontSize={34} style={{ fontFamily: 'var(--font-display)' }}>{Math.round(p.value * 100)}</text>
            <text x={p.x} y={814} textAnchor="middle" className="svg-mono" style={{ fill: on ? 'var(--text)' : undefined }}>{p.label}</text>
            <text x={p.x} y={830} textAnchor="middle" className="svg-mono" style={{ fill: 'var(--text-3)' }}>{p.sub}</text>
          </g>
        )
      })}
    </motion.g>
  )
}
