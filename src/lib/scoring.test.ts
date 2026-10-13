import { describe, expect, it } from 'vitest'
import { gaps, proficiency, readiness, tierOf } from './scoring'
import type { Profile, RoleReq } from './types'

const role: RoleReq = {
  roleId: 't', n: 10, sources: [],
  req: [
    { skillId: 'a', count: 10, importance: 1, jds: [] },
    { skillId: 'b', count: 5, importance: 0.5, jds: [] },
    { skillId: 'c', count: 1, importance: 0.1, jds: [] },
  ],
}
const empty: Profile = { skills: [], courses: [], projects: [], interests: [] }

describe('scoring', () => {
  it('proficiency is the max over sources, and progress ticks raise it', () => {
    const p: Profile = { ...empty, skills: ['x', 'y'], courses: [{ name: 'c', skillIds: ['y'] }], projects: [{ name: 'p', desc: '', skillIds: ['z'] }] }
    expect([proficiency('x', p), proficiency('y', p), proficiency('z', p), proficiency('q', p)]).toEqual([0.4, 0.6, 1, 0])
    expect(proficiency('q', p, { done: ['q:learn'] })).toBe(0.6)
    expect(proficiency('x', p, { done: ['x:project'] })).toBe(1)
  })
  it('readiness follows the spec and ignores importance < 0.15', () => {
    const p: Profile = { ...empty, skills: ['b'], projects: [{ name: 'p', desc: '', skillIds: ['a'] }] }
    expect(readiness(role, p)).toBeCloseTo((1 * 1 + 0.5 * 0.4) / 1.5, 5)
    expect(readiness(role, empty)).toBe(0)
  })
  it('gaps are ranked by importance * (1 - proficiency) with tiers', () => {
    const g = gaps(role, { ...empty, skills: ['b'] })
    expect(g.map((x) => x.skillId)).toEqual(['a', 'b'])
    expect(g[1].gap).toBeCloseTo(0.5 * 0.6, 5)
    expect(g[0].status).toBe('missing')
    expect(g[1].status).toBe('partial')
    expect([tierOf(0.6), tierOf(0.3), tierOf(0.29)]).toEqual(['core', 'common', 'nice'])
  })
})
