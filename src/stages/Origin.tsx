import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Stage } from '../ui/Stage'
import { Canvas } from '../ui/Canvas'
import { Constellation, type CNode } from '../ui/Constellation'
import { Chip } from '../ui/Chip'
import { Field } from '../ui/Field'
import { useApp } from '../lib/store'
import { TAX, layoutOf, matcher, skillName } from '../lib/data'
import { cvUnknown, parseCourses, parseList, parseProjects, resolveTerm, scanText } from '../lib/extract'
import { readCv } from '../lib/cv'
import { llm } from '../lib/llm'
import { EASE } from '../lib/motion'

const uniq = <T,>(a: T[]) => [...new Set(a)]
const hpos = (s: string): [number, number] => {
  const h = [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  return [60 + (h % 500), 60 + ((h >> 8) % 520)]
}

export default function Origin() {
  const profile = useApp((s) => s.profile)
  const patch = useApp((s) => s.patchProfile)
  const unknown = useApp((s) => s.unknown)
  const setUnknown = useApp((s) => s.setUnknown)
  const go = useApp((s) => s.go)
  const [courses, setCourses] = useState(profile.courses.map((c) => c.name).join(', '))
  const [built, setBuilt] = useState(profile.projects.map((p) => p.desc).join('; '))
  const [draft, setDraft] = useState('')
  const [note, setNote] = useState('')
  const [sweep, setSweep] = useState(false)
  const [drag, setDrag] = useState(false)
  const [mapping, setMapping] = useState<string | null>(null)
  const [saved, setSaved] = useState({ courses, built })

  const addSkills = (text: string) => {
    const { ids, unknown: u } = parseList(text, matcher)
    const cur = useApp.getState()
    patch({ skills: uniq([...cur.profile.skills, ...ids]) })
    setUnknown(uniq([...cur.unknown, ...u]))
    setNote(`Resolved ${ids.length}.${u.length ? ` Unrecognised: ${u.length}.` : ''}`)
  }
  const commitCourses = () => {
    if (courses === saved.courses) return
    patch({ courses: parseCourses(courses, matcher) })
    setSaved((s) => ({ ...s, courses }))
  }
  const commitBuilt = () => {
    if (built === saved.built) return
    patch({ projects: parseProjects(built, matcher) })
    setSaved((s) => ({ ...s, built }))
  }

  async function readFile(file: File) {
    setSweep(true)
    setNote('Reading CV.')
    try {
      const text = await readCv(file)
      const ids = scanText(text, matcher)
      let unk = cvUnknown(text, matcher)
      if (unk.length) {
        const out = (await llm('extract', text.slice(0, 3000))) as { skills?: string[] } | null
        const names = new Set((out?.skills ?? []).map((s) => s.toLowerCase()))
        for (const t of out?.skills ?? []) {
          const id = resolveTerm(t, matcher)
          if (id) ids.push(id)
        }
        unk = unk.filter((u) => !names.has(u.toLowerCase()))
      }
      const cur = useApp.getState()
      patch({ skills: uniq([...cur.profile.skills, ...ids]) })
      setUnknown(uniq([...cur.unknown, ...unk]))
      setNote(`CV read. ${uniq(ids).length} skills found.`)
    } catch {
      setNote('Could not read that file.')
    } finally {
      setTimeout(() => setSweep(false), 1300)
    }
  }

  useEffect(() => {
    const over = (e: DragEvent) => { e.preventDefault(); setDrag(true) }
    const leave = (e: DragEvent) => { if (!e.relatedTarget) setDrag(false) }
    const drop = (e: DragEvent) => {
      e.preventDefault()
      setDrag(false)
      const f = e.dataTransfer?.files[0]
      if (f) void readFile(f)
    }
    window.addEventListener('dragover', over)
    window.addEventListener('dragleave', leave)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragover', over)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('drop', drop)
    }
  }, [])

  const src = new Map<string, Set<string>>()
  const mark = (id: string, s: string) => src.set(id, (src.get(id) ?? new Set()).add(s))
  profile.skills.forEach((id) => mark(id, 'list'))
  profile.courses.forEach((c) => c.skillIds.forEach((id) => mark(id, 'course')))
  profile.projects.forEach((p) => p.skillIds.forEach((id) => mark(id, 'project')))

  const lay = layoutOf('all')
  const nodes: CNode[] = [
    ...[...src.keys()].flatMap((id): CNode[] => {
      const p = lay?.nodes[id]
      return p ? [{ id, x: p[0], y: p[1], r: 6, state: 'owned', imp: 1, label: skillName(id) }] : []
    }),
    ...unknown.map((u): CNode => { const [x, y] = hpos(u); return { id: `?${u}`, x, y, r: 6, state: 'unknown', imp: 1, label: u } }),
  ]
  const pick = (id: string) => id.startsWith('?') && setMapping(id.slice(1))
  const mapTo = (skillId: string) => {
    if (!mapping || !skillId) return
    patch({ skills: uniq([...profile.skills, skillId]) })
    setUnknown(unknown.filter((u) => u !== mapping))
    setMapping(null)
  }
  const enter = (fn: () => void) => (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); fn() } }
  const sentence = 'flex flex-wrap items-baseline gap-x-4 gap-y-2 font-display text-[32px] leading-tight'

  return (
    <Stage num="01" kicker="Chapter 01 · Origin" title="Where you *stand.*">
      <Canvas label={`Your constellation: ${src.size} skills recognised`}>
        <Constellation ox={730} oy={150} w={620} nodes={nodes} active={null} labelMin={0.5} onPick={pick} />
      </Canvas>
      <div className="relative z-20 mt-16 flex max-w-[600px] flex-col gap-8">
        <label className={sentence}>I study
          <Field value={courses} placeholder="your courses" onChange={(e) => setCourses(e.target.value)} onBlur={commitCourses} onKeyDown={enter(commitCourses)} />
        </label>
        <div>
          <label className={sentence}>I know
            <Field value={draft} placeholder="python, sklearn, docker basics" onChange={(e) => setDraft(e.target.value)}
              onPaste={(e) => { e.preventDefault(); addSkills(e.clipboardData.getData('text')) }}
              onBlur={() => { if (draft.trim()) { addSkills(draft); setDraft('') } }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (draft.trim()) addSkills(draft); setDraft('') } }} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...src].map(([id, s]) => (
              <Chip key={id} tone="owned" onRemove={s.has('list') ? () => patch({ skills: profile.skills.filter((x) => x !== id) }) : undefined}>
                {skillName(id)} <span className="text-text-3">{[...s].join(' · ')}</span>
              </Chip>
            ))}
            {unknown.map((u) => <Chip key={u} tone="unknown" onClick={() => setMapping(u)}>{u} · map this</Chip>)}
          </div>
          {mapping && (
            <select autoFocus defaultValue="" onChange={(e) => mapTo(e.target.value)} onBlur={() => setMapping(null)} className="mt-3 border border-line-strong bg-bg-1 p-2 font-mono text-[11px] uppercase text-text-2">
              <option value="" disabled>Map “{mapping}” to…</option>
              {[...TAX].sort((a, b) => a.name.localeCompare(b.name)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>
        <label className={sentence}>I’ve built
          <Field value={built} placeholder="a project, in a line" onChange={(e) => setBuilt(e.target.value)} onBlur={commitBuilt} onKeyDown={enter(commitBuilt)} />
        </label>
        <div className="flex items-center gap-8">
          <button className="btn-primary" onClick={() => { commitCourses(); commitBuilt(); go(2) }}>Choose a role</button>
          <p className="mono-label" aria-live="polite">{note || 'Drop a CV (PDF) anywhere.'}</p>
        </div>
      </div>
      {sweep && <motion.div aria-hidden className="pointer-events-none fixed bottom-0 left-0 top-0 z-30 w-0 border-l border-dashed border-violet-hi" initial={{ x: 0 }} animate={{ x: '100vw' }} transition={{ duration: 1.2, ease: EASE }} />}
      {drag && <div className="mono-label pointer-events-none fixed inset-4 z-30 flex items-center justify-center border border-dashed border-violet-hi">Drop CV</div>}
    </Stage>
  )
}
