import { useState } from 'react'
import { Stage } from '../ui/Stage'
import { Canvas, Frame, at } from '../ui/Canvas'
import { ElevationLine, type Waypoint } from '../ui/ElevationLine'
import { Badge } from '../ui/Badge'
import { Check } from '../ui/Check'
import { Sheet } from '../ui/Sheet'
import { useApp } from '../lib/store'
import { useRoadmap, useRole } from '../lib/hooks'
import { RES, skillName } from '../lib/data'
import { MAX_PAN, elevPoints } from '../lib/geom'
import { roleName } from '../lib/roles'

export default function Ascent() {
  const rm = useRoadmap()
  const role = useRole()
  const pan = useApp((s) => s.pan)
  const setPan = useApp((s) => s.setPan)
  const done = useApp((s) => s.progress.done)
  const tick = useApp((s) => s.tick)
  const [sel, setSel] = useState<number | null>(null)
  const m = sel === null ? undefined : rm.milestones[sel]

  const pts = elevPoints(rm.readiness)
  const points: Waypoint[] = [
    { x: pts[0][0], y: pts[0][1], value: rm.readiness[0], label: 'NOW', sub: '' },
    ...rm.milestones.map((ms, i): Waypoint => ({ x: pts[i + 1][0], y: pts[i + 1][1], value: rm.readiness[i + 1], label: ms.label, sub: ms.skills.slice(0, 2).map(skillName).join(' · ') })),
  ]
  const clamp = (v: number) => Math.max(0, Math.min(MAX_PAN, v))
  const select = (i: number) => { setSel(i); setPan(clamp(points[i + 1].x - 600)) }

  return (
    <Stage num="04" kicker="Chapter 04 · Ascent" title={roleName(role.roleId)} className=""
      onWheel={(e) => setPan(clamp(pan + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)))}>
      <Canvas label={`Roadmap: readiness rises from ${Math.round(rm.readiness[0] * 100)} to ${Math.round(rm.readiness[rm.readiness.length - 1] * 100)} percent across ${rm.milestones.length} milestones`}>
        <ElevationLine points={points} sel={sel} onSelect={select} pan={pan} />
      </Canvas>
      <Frame>
        <p style={at(130, 190, 420)} className="mono-label">
          {rm.milestones.length ? 'Scroll to travel. Select a waypoint.' : 'Nothing left to close.'}
        </p>
      </Frame>
      <Sheet open={!!m} onClose={() => setSel(null)} kicker={m ? `Waypoint ${sel! + 1}` : ''} title={m?.label ?? ''}>
        {m && (
          <>
            <p className="mono-label mb-2">Skills</p>
            {m.skills.map((id) => (
              <label key={id} className="flex cursor-pointer items-center gap-3 py-2">
                <Check checked={done.includes(`${id}:learn`)} onChange={(v) => tick(`${id}:learn`, v)} label={`Learned ${skillName(id)}`} />
                <span>{skillName(id)}</span>
              </label>
            ))}
            {m.resourceIds.length > 0 && <p className="mono-label mb-2 mt-8">Resources</p>}
            {m.resourceIds.map((id) => {
              const r = RES.get(id)
              return r && (
                <div key={id} className="flex items-center gap-3 py-2">
                  <Badge kind="curated" />
                  <a href={r.url} target="_blank" rel="noreferrer" className="link-draw">{r.title}</a>
                </div>
              )
            })}
            <p className="mono-label mb-2 mt-8">Portfolio project</p>
            <div className="border border-dashed border-violet-hi/70 p-4">
              <Badge kind="generated" />
              <p className="mb-2 mt-3 font-display text-[26px] leading-tight">{m.project.title}</p>
              <p className="mb-4 text-text-2">{m.project.pitch}</p>
              <label className="flex cursor-pointer items-center gap-3">
                <Check checked={done.includes(`${m.projectSkill}:project`)} onChange={(v) => tick(`${m.projectSkill}:project`, v)} label="Built it" />
                <span>Built it</span>
              </label>
            </div>
          </>
        )}
      </Sheet>
    </Stage>
  )
}
