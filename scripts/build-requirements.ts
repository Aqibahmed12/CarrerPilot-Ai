import fs from 'node:fs'
import path from 'node:path'
import { buildMatcher, scanText } from '../src/lib/extract'
import { ROLES } from '../src/lib/roles'
import type { Requirements, RoleReq, Skill } from '../src/lib/types'

const tax = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf8')) as Skill[]
const m = buildMatcher(tax)
let sample = false

const roles: RoleReq[] = ROLES.map((r) => {
  const dir = `data/jds/${r.id}`
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.txt')).sort() : []
  const hits = new Map<string, number[]>()
  const sources: RoleReq['sources'] = []
  files.forEach((f, i) => {
    if (f.includes('.SAMPLE.')) sample = true
    const [url, ...rest] = fs.readFileSync(path.join(dir, f), 'utf8').split('\n')
    sources.push({ title: (rest.find((l) => l.trim()) ?? f).trim().slice(0, 90), url: url.trim() })
    for (const id of scanText(rest.join('\n'), m)) hits.set(id, [...(hits.get(id) ?? []), i])
  })
  const n = files.length
  const req = [...hits]
    .map(([skillId, jds]) => ({ skillId, count: jds.length, importance: +(jds.length / n).toFixed(4), jds }))
    .sort((a, b) => b.count - a.count || a.skillId.localeCompare(b.skillId))
  return { roleId: r.id, n, req, sources }
})

const out: Requirements = { sample, roles }
fs.mkdirSync('data/generated', { recursive: true })
fs.writeFileSync('data/generated/requirements.json', JSON.stringify(out))
console.log(roles.map((r) => `${r.roleId}: n=${r.n}, ${r.req.length} skills`).join('\n'), sample ? '\n(sample data)' : '')
