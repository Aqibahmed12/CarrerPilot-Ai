import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '../lib/motion'

export type CNode = {
  id: string
  x: number
  y: number
  r: number
  state: 'owned' | 'partial' | 'missing' | 'nice' | 'unknown'
  imp: number
  label: string
  top?: boolean
}

type Props = {
  ox: number
  oy: number
  w: number
  nodes: CNode[]
  edges?: [string, string][]
  active?: string | null
  labelMin?: number
  onHover?: (id: string | null) => void
  onPick?: (id: string) => void
}

const BOX = { transformBox: 'fill-box', transformOrigin: 'center' } as const

export function Constellation({ ox, oy, w, nodes, edges = [], active, labelMin = 0.5, onHover, onPick }: Props) {
  const pos = new Map(nodes.map((n) => [n.id, n]))
  return (
    <g transform={`translate(${ox} ${oy})`}>
      {edges.map(([a, b]) => {
        const p = pos.get(a)
        const q = pos.get(b)
        return p && q ? <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(255,255,255,.12)" strokeWidth={1} /> : null
      })}
      {nodes.map((n) => (
        <NodeView key={n.id} n={n} w={w} on={active === n.id} labelMin={labelMin} onHover={onHover} onPick={onPick} />
      ))}
    </g>
  )
}

function NodeView({ n, w, on, labelMin, onHover, onPick }: { n: CNode; w: number; on: boolean; labelMin: number; onHover?: Props['onHover']; onPick?: Props['onPick'] }) {
  const reduce = useReducedMotion()
  const half = Math.PI * n.r
  const showLabel = on || n.imp >= labelMin || n.state === 'unknown'
  const flip = n.x > w * 0.78
  const pulse = n.state === 'missing' && n.top && !reduce
  return (
    <g>
      <motion.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }} style={BOX}>
        {n.state === 'owned' && (
          <>
            <circle cx={n.x} cy={n.y} r={n.r * 2.2} fill="var(--violet-glow)" opacity={0.45} />
            <circle cx={n.x} cy={n.y} r={n.r} fill="var(--violet)" />
            {!reduce && (
              <motion.circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--violet-hi)" strokeWidth={1} initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 1.2, ease: EASE }} style={BOX} />
            )}
          </>
        )}
        {n.state === 'partial' && <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--violet)" strokeWidth={1.5} strokeDasharray={`${half} ${half}`} />}
        {n.state === 'missing' && (
          <motion.circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--ember)" strokeWidth={1.5} animate={pulse ? { opacity: [1, 0.35, 1] } : { opacity: 1 }} transition={pulse ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined} />
        )}
        {n.state === 'nice' && <circle cx={n.x} cy={n.y} r={Math.max(2.5, n.r * 0.7)} fill="var(--text-3)" />}
        {n.state === 'unknown' && <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--text-3)" strokeWidth={1.5} strokeDasharray="3 3" />}
        {on && <circle cx={n.x} cy={n.y} r={n.r + 6} fill="none" stroke="var(--violet-hi)" strokeWidth={1} />}
        <circle cx={n.x} cy={n.y} r={Math.max(n.r + 8, 14)} fill="transparent" style={{ pointerEvents: 'auto', cursor: onPick ? 'pointer' : 'default' }} onMouseEnter={() => onHover?.(n.id)} onMouseLeave={() => onHover?.(null)} onClick={() => onPick?.(n.id)} />
      </motion.g>
      {showLabel && (
        <text x={n.x + (flip ? -(n.r + 8) : n.r + 8)} y={n.y + 3} textAnchor={flip ? 'end' : 'start'} className="svg-mono" style={{ fill: on ? 'var(--text)' : undefined }}>
          {(n.state === 'unknown' ? `${n.label} · map this` : n.label).toUpperCase()}
        </text>
      )}
    </g>
  )
}
