import fs from 'node:fs'
import { ROLES } from '../src/lib/roles'
import { CATS } from '../src/lib/scoring'
import type { Layout, Requirements, Skill } from '../src/lib/types'

const tax = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf8')) as Skill[]
const reqs = JSON.parse(fs.readFileSync('data/generated/requirements.json', 'utf8')) as Requirements
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

type Item = { id: string; cat: string; imp: number }

function layout(items: Item[], w: number, h: number, seed: string, sp: number): Layout {
  const rand = rng(hash(seed))
  const pos = new Map<string, [number, number]>()
  const home = new Map<string, [number, number]>()
  CATS.forEach((c, ci) => {
    const a = (ci / CATS.length) * Math.PI * 2 - Math.PI / 2
    const cx = w / 2 + Math.cos(a) * w * 0.3
    const cy = h / 2 + Math.sin(a) * h * 0.3
    items.filter((i) => i.cat === c).sort((x, y) => y.imp - x.imp || x.id.localeCompare(y.id)).forEach((it, i) => {
      const ang = i * 2.39996 + rand() * 0.6
      const rad = sp * Math.sqrt(i + 0.6)
      pos.set(it.id, [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad])
      home.set(it.id, [cx, cy])
    })
  })
  const rad = (id: string) => 3 + (items.find((i) => i.id === id)?.imp ?? 0.3) * 10 + sp * 0.35
  const ids = [...pos.keys()]
  for (let k = 0; k < 90; k++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const p = pos.get(ids[i])!
        const q = pos.get(ids[j])!
        const dx = q[0] - p[0]
        const dy = q[1] - p[1]
        const d = Math.hypot(dx, dy) || 0.01
        const min = rad(ids[i]) + rad(ids[j])
        if (d < min) {
          const push = (min - d) / 2
          p[0] -= (dx / d) * push; p[1] -= (dy / d) * push
          q[0] += (dx / d) * push; q[1] += (dy / d) * push
        }
      }
    }
    for (const id of ids) {
      const p = pos.get(id)!
      const c = home.get(id)!
      p[0] += (c[0] - p[0]) * 0.01; p[1] += (c[1] - p[1]) * 0.01
      p[0] = Math.min(w - 28, Math.max(28, p[0])); p[1] = Math.min(h - 28, Math.max(28, p[1]))
    }
  }
  return { w, h, nodes: Object.fromEntries(ids.map((id) => [id, [Math.round(pos.get(id)![0] * 10) / 10, Math.round(pos.get(id)![1] * 10) / 10]])) }
}

fs.mkdirSync('data/layouts', { recursive: true })
const cat = new Map(tax.map((s) => [s.id, s.cat]))
for (const r of ROLES) {
  const role = reqs.roles.find((x) => x.roleId === r.id)
  if (!role) continue
  const items = role.req.map((q) => ({ id: q.skillId, cat: cat.get(q.skillId) ?? 'tool', imp: q.count / role.n }))
  fs.writeFileSync(`data/layouts/${r.id}.json`, JSON.stringify(layout(items, 740, 590, r.id, 38)))
}
fs.writeFileSync('data/layouts/all.json', JSON.stringify(layout(tax.map((s) => ({ id: s.id, cat: s.cat, imp: 0.5 })), 620, 640, 'all', 30)))
console.log('layouts written')
