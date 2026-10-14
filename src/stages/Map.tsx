import { useMemo, useState } from 'react'
import { Stage } from '../ui/Stage'
import { Canvas, Frame, at } from '../ui/Canvas'
import { Constellation, type CNode } from '../ui/Constellation'
import { Ring } from '../ui/Ring'
import { Badge } from '../ui/Badge'
import { Sheet } from '../ui/Sheet'
import { useApp } from '../lib/store'
import { useRole } from '../lib/hooks'
import { SAMPLE, TAX, layoutOf, skillName } from '../lib/data'
import { RING } from '../lib/geom'
import { roleName } from '../lib/roles'
import { gaps, proficiency, readiness, tierOf } from '../lib/scoring'

export default function MapStage() {
  const profile = useApp((s) => s.profile)
  const progress = useApp((s) => s.progress)
  const role = useRole()
  const lay = layoutOf(role.roleId)
  const [sim, setSim] = useState<string[]>([])
  const [hover, setHover] = useState<string | null>(null)
  const [why, setWhy] = useState<string | null>(null)

  const ov = useMemo(() => Object.fromEntries(sim.map((id) => [id, 1])), [sim])
  const rows = gaps(role, profile, progress)
  const base = readiness(role, profile, progress)
  const cur = readiness(role, profile, progress, ov)
  const delta = Math.round(cur * 100) - Math.round(base * 100)
  const top = new Set(rows.filter((r) => r.status === 'missing' && !sim.includes(r.skillId)).slice(0, 3).map((r) => r.skillId))
  const toggle = (id: string) => rows.some((r) => r.skillId === id) && setSim((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const nodes: CNode[] = role.req.flatMap((r): CNode[] => {
    const p = lay?.nodes[r.skillId]
    if (!p) return []
    const imp = r.count / role.n
    const pr = Math.max(proficiency(r.skillId, profile, progress), ov[r.skillId] ?? 0)
    const state: CNode['state'] = pr >= 1 ? 'owned' : pr > 0 ? 'partial' : tierOf(imp) === 'nice' ? 'nice' : 'missing'
    return [{ id: r.skillId, x: p[0], y: p[1], r: 3 + imp * 10, state, imp, label: skillName(r.skillId), top: top.has(r.skillId) }]
  })
  const ids = new Set(nodes.map((n) => n.id))
  const edges = TAX.flatMap((s) => (s.prereq ?? []).filter((p) => ids.has(s.id) && ids.has(p)).map((p): [string, string] => [p, s.id]))
  const whyRow = why ? role.req.find((r) => r.skillId === why) : undefined

  return (
    <Stage num="03" kicker="Chapter 03 · The Map" title={roleName(role.roleId)} className="">
      <Canvas label={`Skill constellation for ${roleName(role.roleId)}: ${Math.round(cur * 100)} percent ready, ${rows.length} gaps`}>
        <Constellation ox={110} oy={190} w={740} nodes={nodes} edges={edges} active={hover} onHover={setHover} onPick={toggle} />
        <Ring {...RING} value={cur} delta={delta} />
      </Canvas>
      <Frame>
        <p style={at(960, 470, 370)} className="text-[15px] text-text-2">Distance: {100 - Math.round(cur * 100)} points.</p>
        <ul style={at(960, 505, 370)} className="pointer-events-auto m-0 max-h-[290px] list-none overflow-y-auto p-0 pr-2">
          {rows.slice(0, 12).map((g) => {
            const on = sim.includes(g.skillId)
            return (
              <li key={g.skillId} className="border-t border-line py-3 first:border-t-0" onMouseEnter={() => setHover(g.skillId)} onMouseLeave={() => setHover(null)}>
                <div className="flex items-start gap-3">
                  <button type="button" aria-pressed={on} onClick={() => toggle(g.skillId)} className={`flex-1 cursor-pointer border-0 bg-transparent p-0 text-left text-[15px] ${on ? 'text-violet-hi' : 'text-text'}`}>
                    <span className="font-display text-[24px] leading-none">{skillName(g.skillId)}.</span>{' '}
                    <span className="text-text-2">Required in {g.count} of {g.n} JDs.</span>{' '}
                    <span className="mono-label">{g.status === 'missing' ? 'Missing' : 'Underdeveloped'}</span>
                    <span className="mt-2 block h-[2px] w-full bg-line"><span className="block h-full bg-ember" style={{ width: `${g.importance * 100}%` }} /></span>
                  </button>
                  <div className="flex flex-col items-end gap-2">
                    <Badge kind="verified" compact />
                    <button type="button" onClick={() => setWhy(g.skillId)} className="link-draw cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[.12em]">Why?</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Frame>
      <Sheet open={!!whyRow} onClose={() => setWhy(null)} kicker="Evidence" title={why ? skillName(why) : ''}>
        {whyRow && (
          <>
            <p className="mb-4">Required in {whyRow.count} of {role.n} {roleName(role.roleId)} JDs.</p>
            <Badge kind="verified" n={role.n} />
            {SAMPLE && <p className="mono-label mt-4 !text-text-3">Sample data · placeholder JDs</p>}
            <ul className="mt-6 list-none p-0">
              {whyRow.jds.map((i) => {
                const s = role.sources[i]
                return (
                  <li key={i} className="border-t border-line py-3 text-[15px]">
                    {s.url.startsWith('http') ? <a href={s.url} target="_blank" rel="noreferrer" className="link-draw">{s.title}</a> : <span>{s.title}</span>}
                    <span className="mono-label mt-1 block !text-text-3">{s.url}</span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Sheet>
    </Stage>
  )
}
