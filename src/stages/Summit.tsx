import { Stage } from '../ui/Stage'
import { Canvas, Frame, at } from '../ui/Canvas'
import { Contour } from '../ui/Contour'
import { Check } from '../ui/Check'
import { useApp } from '../lib/store'
import { useRoadmap, useRole } from '../lib/hooks'
import { SKILL, skillName } from '../lib/data'
import { CONTOUR } from '../lib/geom'
import { roleName } from '../lib/roles'
import { axes, readiness } from '../lib/scoring'

const LABEL: Record<string, string> = { lang: 'Languages', framework: 'Frameworks', tool: 'Tools', concept: 'Concepts', data: 'Data', soft: 'Soft' }

export default function Summit() {
  const profile = useApp((s) => s.profile)
  const progress = useApp((s) => s.progress)
  const tick = useApp((s) => s.tick)
  const reset = useApp((s) => s.reset)
  const role = useRole()
  const rm = useRoadmap()

  const items = rm.milestones.flatMap((m) => [
    ...m.skills.map((id) => ({ key: `${id}:learn`, text: `Learn ${skillName(id)}` })),
    { key: `${m.projectSkill}:project`, text: `Build: ${m.project.title}` },
  ])
  const first = items.findIndex((i) => !progress.done.includes(i.key))
  const shown = items.slice(Math.max(0, first - 1), Math.max(0, first - 1) + 6)
  const now = readiness(role, profile, progress)
  const ax = axes(role, (id) => SKILL.get(id)?.cat, profile, progress, rm.milestones.flatMap((m) => m.skills)).map((a) => ({ ...a, label: LABEL[a.cat] }))
  const end = rm.readiness[rm.readiness.length - 1]
  const next = first >= 0 ? items[first].text : 'Roadmap complete'

  return (
    <Stage num="05" kicker="Chapter 05 · Summit" title={roleName(role.roleId)} className="">
      <Canvas label={`Contour chart: you at ${Math.round(now * 100)} percent, role requirement solid, projected ${Math.round(end * 100)} percent dashed`}>
        <Contour {...CONTOUR} R={CONTOUR.r} axes={ax} />
      </Canvas>
      <Frame>
        <p style={{ ...at(130, 180), fontSize: 144, lineHeight: 1 }} className="font-display">{Math.round(now * 100)}<span className="text-[40px] text-text-2">%</span></p>
        <p style={at(130, 350, 420)} className="mono-label">Start {Math.round(rm.readiness[0] * 100)} → Now {Math.round(now * 100)} → Projected {Math.round(end * 100)}</p>
        <p style={at(130, 385, 420)} className="text-[15px]"><span className="mono-label mr-3">Next best action</span>{next}.</p>
        <ul style={at(130, 440, 430)} className="pointer-events-auto m-0 list-none p-0">
          {shown.map((it) => (
            <li key={it.key} className="py-1.5">
              <label className="flex cursor-pointer items-center gap-3 text-[15px]">
                <Check checked={progress.done.includes(it.key)} onChange={(v) => tick(it.key, v)} label={it.text} />
                <span className={progress.done.includes(it.key) ? 'text-text-3' : ''}>{it.text}</span>
              </label>
            </li>
          ))}
        </ul>
        <button style={{ ...at(130, 770), pointerEvents: 'auto' }} className="link-draw cursor-pointer border-0 bg-transparent p-0 text-[13px]" onClick={reset}>Reset demo</button>
      </Frame>
    </Stage>
  )
}
