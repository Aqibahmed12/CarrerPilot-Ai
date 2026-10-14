import { animate, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { EASE } from '../lib/motion'

const rad = (d: number) => (d * Math.PI) / 180

export function Ring({ cx, cy, r, value, delta }: { cx: number; cy: number; r: number; value: number; delta: number }) {
  const pct = value * 100
  const [shown, setShown] = useState(Math.round(pct))
  const prev = useRef(pct)
  useEffect(() => {
    const c = animate(prev.current, pct, { duration: 0.8, ease: EASE, onUpdate: (v) => { prev.current = v; setShown(Math.round(v)) } })
    return () => c.stop()
  }, [pct])
  const p = (a: number, rr = r): [number, number] => [cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a))]
  const [x0, y0] = p(135)
  const [x1, y1] = p(45)
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const a = 135 + i * 13.5
    const major = i % 5 === 0
    return { a, major, from: p(a, r + 8), to: p(a, r + (major ? 18 : 14)) }
  })
  return (
    <g>
      {ticks.map((t) => (
        <line key={t.a} x1={t.from[0]} y1={t.from[1]} x2={t.to[0]} y2={t.to[1]} stroke={t.major ? 'var(--text-3)' : 'var(--line-strong)'} strokeWidth={1} />
      ))}
      <motion.path
        d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`}
        fill="none"
        stroke="var(--violet)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: value }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      <text x={cx} y={cy - 66} textAnchor="middle" className="svg-mono">READINESS</text>
      <text x={cx} y={cy + 38} textAnchor="middle" fill="var(--text)" fontSize={120} style={{ fontFamily: 'var(--font-display)' }}>
        {shown}
        <tspan fontSize={36} dx={4} fill="var(--text-2)">%</tspan>
      </text>
      <motion.text
        x={cx}
        y={cy + 76}
        textAnchor="middle"
        fill="var(--violet-hi)"
        fontSize={14}
        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.1em' }}
        animate={{ opacity: delta > 0 ? 1 : 0, y: delta > 0 ? cy + 76 : cy + 84 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        +{delta}
      </motion.text>
    </g>
  )
}
