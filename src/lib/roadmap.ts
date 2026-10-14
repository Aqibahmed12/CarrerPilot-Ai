import { gaps, proficiency, readiness } from './scoring'
import type { Profile, Project, Rec, Resource, RoleReq, Skill } from './types'

export type Milestone = { id: string; label: string; skills: string[]; resourceIds: string[]; project: Project; projectSkill: string }
export type Roadmap = { milestones: Milestone[]; readiness: number[] }
const LABELS = ['WK 1-2', 'WK 3-4', 'WK 5-6', 'WK 7-8']

export function buildRoadmap(role: RoleReq, profile: Profile, tax: Skill[], recs: Rec[], resources: Resource[], max = 12): Roadmap {
  const byId = new Map(tax.map((s) => [s.id, s]))
  const inRole = new Set(role.req.map((r) => r.skillId))
  const have = (id: string) => proficiency(id, profile) >= 0.6
  const order: string[] = []
  const place = (id: string, seen = new Set<string>()) => {
    if (order.includes(id) || seen.has(id)) return
    seen.add(id)
    for (const p of byId.get(id)?.prereq ?? []) if (inRole.has(p) && !have(p)) place(p, seen)
    order.push(id)
  }
  for (const g of gaps(role, profile)) {
    if (order.length >= max) break
    place(g.skillId)
  }
  const list = order.slice(0, max)
  const r0 = readiness(role, profile)
  if (!list.length) return { milestones: [], readiness: [r0] }

  const k = Math.min(4, list.length)
  const base = Math.floor(list.length / k)
  const extra = list.length % k
  const milestones: Milestone[] = []
  const reach: Record<string, number> = {}
  const cumulative = [r0]
  let at = 0
  for (let i = 0; i < k; i++) {
    const skills = list.slice(at, (at += base + (i < extra ? 1 : 0)))
    const lead = skills[0]
    const rec = recs.find((r) => r.roleId === role.roleId && r.skillId === lead)
    const name = byId.get(lead)?.name ?? lead
    const resourceIds = [...new Set(skills.flatMap((s) => resources.filter((r) => r.skillId === s).slice(0, 1).map((r) => r.id)))].slice(0, 2)
    milestones.push({
      id: `m${i + 1}`,
      label: LABELS[i],
      skills,
      resourceIds,
      projectSkill: lead,
      project: rec?.projects[0] ?? { title: `Build something small with ${name}`, pitch: `A 6-10 hour project that uses ${name} alongside what you already know.`, skillIds: [lead] },
    })
    for (const s of skills) reach[s] = 1
    cumulative.push(readiness(role, profile, undefined, { ...reach }))
  }
  return { milestones, readiness: cumulative }
}
