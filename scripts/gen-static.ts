import fs from 'node:fs'

const rd = (f: string) => fs.readFileSync(f, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
const out = (f: string, rows: unknown[]) => fs.writeFileSync(f, '[\n' + rows.map((r) => JSON.stringify(r)).join(',\n') + '\n]\n')

const tax = rd('data/taxonomy.src.txt').map((l) => {
  const [id, name, cat, al, pre] = l.split('|')
  const s: Record<string, unknown> = { id, name, cat, aliases: al.split(',').map((a) => a.trim()).filter(Boolean) }
  const p = (pre ?? '').split(',').filter(Boolean)
  if (p.length) s.prereq = p
  return s
})
const ids = new Set(tax.map((s) => s.id as string))
for (const s of tax) for (const p of (s.prereq as string[] | undefined) ?? []) if (!ids.has(p)) throw new Error(`bad prereq ${p} on ${s.id}`)
out('data/taxonomy.json', tax)

const res = rd('data/resources.src.txt').map((l, i) => {
  const [skillId, title, url, type] = l.split('|')
  if (!ids.has(skillId)) throw new Error(`bad resource skill ${skillId}`)
  return { id: `r${String(i + 1).padStart(2, '0')}`, skillId, title, url, type }
})
out('data/resources.curated.json', res)
console.log(`taxonomy ${tax.length}, resources ${res.length}`)
