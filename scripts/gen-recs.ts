import fs from 'node:fs'
import { callLLM, llmAvailable } from '../server/core'
import { ROLES } from '../src/lib/roles'
import type { Project, Rec, Requirements, Resource, Skill } from '../src/lib/types'

const tax = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf8')) as Skill[]
const reqs = JSON.parse(fs.readFileSync('data/generated/requirements.json', 'utf8')) as Requirements
const res = JSON.parse(fs.readFileSync('data/resources.curated.json', 'utf8')) as Resource[]
const S = new Map(tax.map((s) => [s.id, s]))
const STACK: Record<string, string[]> = {
  'ml-ai-engineer': ['python', 'pytorch'], 'data-analyst': ['sql', 'excel'],
  'frontend-developer': ['javascript', 'react'], 'backend-developer': ['python', 'postgresql'],
}
const name = (id: string) => S.get(id)?.name ?? id

// Offline fallback when no LLM key is set: deterministic templates. With a key, the top 8 skills per role come from the LLM.
function template(role: string, id: string): Project[] {
  const [a, b] = STACK[role].filter((x) => x !== id)
  const t = name(id)
  const cat = S.get(id)?.cat
  const titles: Record<string, [string, string]> = {
    tool: [`Set up ${t} on a project you already have`, `A reproducible ${t} workflow, documented in a repo`],
    framework: [`Small ${name(a)} app built with ${t}`, `Rebuild a past project using ${t}`],
    data: [`End-to-end analysis of an open dataset with ${t}`, `A reusable ${t} pipeline notebook`],
    concept: [`Applied write-up: ${t} on a public dataset`, `Mini case study of ${t} with a runnable demo`],
    lang: [`Port a small utility to ${t}`, `Ten ${t} exercises wrapped in a tiny CLI`],
    soft: [`Publish a project write-up that shows ${t}`, `Record a five-minute walkthrough of a past project`],
  }
  const [x, y] = titles[cat ?? 'concept']
  return [
    { title: x, pitch: `Scope it to one weekend. Uses ${t} with ${name(a)} and ${name(b)}.`, skillIds: [id, a, b] },
    { title: y, pitch: `A second angle on ${t}, kept small enough to ship in 6-10 hours.`, skillIds: [id, a] },
  ]
}

const recs: Rec[] = []
const live = llmAvailable()
for (const r of ROLES) {
  const role = reqs.roles.find((x) => x.roleId === r.id)!
  const top = [...role.req].sort((p, q) => q.count - p.count).slice(0, 12)
  for (const [i, q] of top.entries()) {
    let projects = template(r.id, q.skillId)
    if (live && i < 8) {
      const out = (await callLLM('recs', `Role: ${r.name}\nTarget skill: ${name(q.skillId)}\nStudent skills: ${STACK[r.id].map(name).join(', ')}`)) as { projects?: Project[] } | null
      if (out?.projects?.length === 2) projects = out.projects.map((p) => ({ title: String(p.title), pitch: String(p.pitch), skillIds: (p.skillIds ?? []).filter((s) => S.has(s)) }))
    }
    recs.push({ roleId: r.id, skillId: q.skillId, resourceIds: res.filter((x) => x.skillId === q.skillId).map((x) => x.id).slice(0, 2), projects })
  }
}
fs.writeFileSync('data/generated/recs.json', JSON.stringify(recs))
console.log(`recs: ${recs.length} (${live ? 'LLM + template fallback' : 'templates, no LLM key'})`)
