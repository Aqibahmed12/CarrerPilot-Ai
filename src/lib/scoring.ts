import type { Cat, Profile, Progress, RoleReq } from './types'

export const MIN_IMPORTANCE = 0.15
export const CATS: Cat[] = ['lang', 'framework', 'tool', 'concept', 'data', 'soft']
export type Tier = 'core' | 'common' | 'nice'
export type Override = Record<string, number>
const NONE: Progress = { done: [] }

export const tierOf = (imp: number): Tier => (imp >= 0.6 ? 'core' : imp >= 0.3 ? 'common' : 'nice')

export function proficiency(id: string, p: Profile, prog: Progress = NONE): number {
  let v = 0
  if (p.skills.includes(id)) v = Math.max(v, 0.4)
  if (p.courses.some((c) => c.skillIds.includes(id))) v = Math.max(v, 0.6)
  if (p.projects.some((x) => x.skillIds.includes(id))) v = 1
  if (prog.done.includes(`${id}:learn`)) v = Math.max(v, 0.6)
  if (prog.done.includes(`${id}:project`)) v = 1
  return v
}

const prof = (id: string, p: Profile, prog: Progress, ov?: Override) => Math.max(proficiency(id, p, prog), ov?.[id] ?? 0)

export type Gap = {
  skillId: string
  count: number
  n: number
  importance: number
  proficiency: number
  gap: number
  tier: Tier
  status: 'missing' | 'partial'
}

export function gaps(role: RoleReq, p: Profile, prog: Progress = NONE, ov?: Override): Gap[] {
  const out: Gap[] = []
  for (const r of role.req) {
    const importance = r.count / role.n
    if (importance < MIN_IMPORTANCE) continue
    const pr = prof(r.skillId, p, prog, ov)
    const gap = importance * (1 - pr)
    if (gap <= 0) continue
    out.push({ skillId: r.skillId, count: r.count, n: role.n, importance, proficiency: pr, gap, tier: tierOf(importance), status: pr === 0 ? 'missing' : 'partial' })
  }
  return out.sort((a, b) => b.gap - a.gap || b.importance - a.importance || a.skillId.localeCompare(b.skillId))
}

export function readiness(role: RoleReq, p: Profile, prog: Progress = NONE, ov?: Override): number {
  let num = 0
  let den = 0
  for (const r of role.req) {
    const importance = r.count / role.n
    if (importance < MIN_IMPORTANCE) continue
    num += importance * prof(r.skillId, p, prog, ov)
    den += importance
  }
  return den ? num / den : 0
}

export type Axis = { cat: Cat; role: number; you: number; proj: number }

export function axes(role: RoleReq, catOf: (id: string) => Cat | undefined, p: Profile, prog: Progress, projected: string[]): Axis[] {
  const need: Record<string, number> = {}
  const you: Record<string, number> = {}
  const proj: Record<string, number> = {}
  for (const r of role.req) {
    const imp = r.count / role.n
    const c = catOf(r.skillId)
    if (imp < MIN_IMPORTANCE || !c) continue
    const pr = proficiency(r.skillId, p, prog)
    need[c] = (need[c] ?? 0) + imp
    you[c] = (you[c] ?? 0) + imp * pr
    proj[c] = (proj[c] ?? 0) + imp * (projected.includes(r.skillId) ? 1 : pr)
  }
  const norm = Math.max(...CATS.map((c) => need[c] ?? 0), 0.0001)
  return CATS.map((cat) => ({ cat, role: (need[cat] ?? 0) / norm, you: (you[cat] ?? 0) / norm, proj: (proj[cat] ?? 0) / norm }))
}
