import { AnimatePresence, motion } from 'motion/react'
import { Stage } from '../ui/Stage'
import { Canvas, Frame, at } from '../ui/Canvas'
import { contourPath } from '../ui/Contour'
import { useApp } from '../lib/store'
import { REQS, SAMPLE, SKILL } from '../lib/data'
import { HORIZON } from '../lib/geom'
import { ROLES } from '../lib/roles'
import { CATS } from '../lib/scoring'

export default function Horizon() {
  const hover = useApp((s) => s.hover)
  const setHover = useApp((s) => s.setHover)
  const patch = useApp((s) => s.patchProfile)
  const go = useApp((s) => s.go)
  const sel = hover === null ? null : ROLES[hover]
  const info = REQS.roles.find((r) => r.roleId === sel?.id)
  const top = info?.req[0]

  const shape = info
    ? (() => {
        const sum: Record<string, number> = {}
        for (const q of info.req) {
          const c = SKILL.get(q.skillId)?.cat
          if (c && q.count / info.n >= 0.15) sum[c] = (sum[c] ?? 0) + q.count / info.n
        }
        const m = Math.max(...CATS.map((c) => sum[c] ?? 0), 0.01)
        return contourPath(CATS.map((c) => (sum[c] ?? 0) / m), 250)
      })()
    : ''

  return (
    <Stage num="02" kicker="Chapter 02 · Horizon" title="Choose a *role.*" className="">
      <Canvas label="Faint silhouette of the hovered role's skill shape">
        <AnimatePresence>
          {shape && <motion.path key={sel?.id} d={shape} transform="translate(1030 470)" fill="none" stroke="var(--text)" strokeWidth={1} initial={{ opacity: 0 }} animate={{ opacity: 0.16 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
        </AnimatePresence>
      </Canvas>
      <Frame>
        {ROLES.map((r, i) => {
          const n = REQS.roles.find((x) => x.roleId === r.id)?.n ?? 0
          return (
            <button
              key={r.id}
              style={{ ...at(HORIZON.x, HORIZON.y0 + HORIZON.row * i), pointerEvents: 'auto', opacity: hover === null || hover === i ? 1 : 0.25, transition: 'opacity .5s var(--ease)' }}
              className="cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-left text-text"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => { patch({ roleId: r.id }); go(3) }}
            >
              <span className="font-display" style={{ fontSize: 96, lineHeight: '108px', letterSpacing: '-0.02em' }}>{r.name}</span>
              <span className="mono-label ml-6 align-middle">{n} JDs analysed{n < 5 ? ' · low sample' : ''}</span>
            </button>
          )
        })}
        <p style={{ ...at(HORIZON.x, 650), opacity: sel ? 1 : 0, transition: 'opacity .4s var(--ease)' }} className="mono-label">
          {sel && info && top ? `${sel.name} · ${info.n} JDs · top skill: ${SKILL.get(top.skillId)?.name} ${top.count}/${info.n}${SAMPLE ? ' · sample data' : ''}` : '\u00a0'}
        </p>
      </Frame>
    </Stage>
  )
}
