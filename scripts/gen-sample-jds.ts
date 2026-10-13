import fs from 'node:fs'
import { ROLES } from '../src/lib/roles'
import type { Skill } from '../src/lib/types'

// PLACEHOLDER data only. Files are named *.SAMPLE.txt and the UI shows "sample data" while any exist.
const TABLE: Record<string, string> = {
  'ml-ai-engineer': 'python8 machine-learning8 deep-learning7 pytorch6 sklearn6 pandas6 sql6 docker6 git6 mlops5 numpy5 statistics5 tensorflow4 aws4 model-deployment4 nlp4 communication4 computer-vision3 llm3 fastapi3 linux3 huggingface3 transformers3 algorithms3 kubernetes2 mlflow2 jupyter2 cpp2',
  'data-analyst': 'sql8 excel6 python6 statistics6 data-visualization6 communication6 pandas5 tableau4 powerbi4 data-cleaning4 etl3 r3 a-b-testing3 matplotlib2 seaborn2 numpy2 git2 bigquery2 jupyter2 machine-learning2 postgresql2 dbt2 looker2',
  'frontend-developer': 'javascript8 html8 css8 react8 git7 typescript6 responsive-design6 rest-api5 tailwind4 nextjs4 testing4 accessibility4 communication4 nodejs3 jest3 figma3 redux3 graphql3 web-performance3 teamwork3 webpack2 vite2 vue2 angular2',
  'backend-developer': 'sql8 rest-api8 docker7 git7 python5 postgresql5 aws5 testing5 java4 nodejs4 redis4 linux4 microservices4 ci-cd4 authentication4 mysql3 mongodb3 kubernetes3 system-design3 caching3 django3 spring3 express3 go3 teamwork3 communication3 data-structures3 algorithms3 oop3 fastapi2 flask2 graphql2 kafka2 typescript2 github-actions2',
}
const tax = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf8')) as Skill[]
const word = new Map(tax.map((s) => [s.id, s.aliases.find((a) => !a.startsWith('~')) ?? s.name]))
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

for (const r of ROLES) {
  const dir = `data/jds/${r.id}`
  fs.mkdirSync(dir, { recursive: true })
  for (const f of fs.readdirSync(dir)) fs.rmSync(`${dir}/${f}`)
  const entries = TABLE[r.id].split(' ').map((t) => ({ id: t.replace(/\d+$/, ''), n: +(t.match(/\d+$/)?.[0] ?? 0) }))
  for (let i = 0; i < 8; i++) {
    const has = entries.filter((e) => (i * 3 + hash(e.id)) % 8 < e.n).map((e) => word.get(e.id) ?? e.id)
    if (!word.size || has.some((h) => !h)) throw new Error('taxonomy mismatch')
    const nn = String(i + 1).padStart(2, '0')
    const body = [
      `sample://${r.id}/${nn}`,
      `SAMPLE JD ${nn} - Sample Co`,
      `Placeholder text for development only. Sample Co ${nn} is hiring. Requirements: ${has.join(', ')}.`,
    ].join('\n')
    fs.writeFileSync(`${dir}/${nn}.SAMPLE.txt`, body + '\n')
  }
}
console.log('sample JDs written (placeholders)')
