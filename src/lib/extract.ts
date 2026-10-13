import Fuse from 'fuse.js'
import type { Profile, Skill } from './types'

export type Matcher = {
  scan: { id: string; re: RegExp }[]
  exact: Map<string, string>
  fuse: Fuse<{ alias: string; id: string }>
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const uniq = <T,>(a: T[]) => [...new Set(a)]
const FILLER = /\b(basics?|beginner|intermediate|advanced|familiarity|familiar|knowledge|experience|proficiency|proficient|working|skills?|of|with|in)\b/g

export function buildMatcher(tax: Skill[]): Matcher {
  const exact = new Map<string, string>()
  const list: { alias: string; id: string }[] = []
  const scan: Matcher['scan'] = []
  for (const s of tax) {
    const all = [...s.aliases.map((a) => a.replace(/^~/, '').toLowerCase()), s.name.toLowerCase()]
    for (const a of all) {
      if (!exact.has(a)) exact.set(a, s.id)
      list.push({ alias: a, id: s.id })
    }
    const safe = s.aliases.filter((a) => !a.startsWith('~')).map((a) => esc(a.toLowerCase()))
    if (safe.length) scan.push({ id: s.id, re: new RegExp(`(?<![A-Za-z0-9+#])(?:${safe.join('|')})(?![A-Za-z0-9+#])`, 'i') })
  }
  const fuse = new Fuse(list.filter((x) => x.alias.length >= 4), { keys: ['alias'], threshold: 0.2, ignoreLocation: true })
  return { scan, exact, fuse }
}

export const scanText = (text: string, m: Matcher): string[] => m.scan.filter((x) => x.re.test(text)).map((x) => x.id)

export function resolveTerm(term: string, m: Matcher): string | null {
  const raw = term.toLowerCase().trim().replace(/^[-•*]+\s*/, '')
  const hit = m.exact.get(raw)
  if (hit) return hit
  const n = raw.replace(/\(.*?\)/g, ' ').replace(FILLER, ' ').replace(/\s+/g, ' ').trim()
  const h2 = m.exact.get(n)
  if (h2) return h2
  if (n.length < 4) return null
  return m.fuse.search(n, { limit: 1 })[0]?.item.id ?? null
}

export function parseList(text: string, m: Matcher): { ids: string[]; unknown: string[] } {
  const ids: string[] = []
  const unknown: string[] = []
  for (const part of text.split(/[,;\n•|]+/).map((s) => s.trim()).filter(Boolean)) {
    const id = resolveTerm(part, m)
    if (id) ids.push(id)
    else if (part.length <= 40) unknown.push(part)
  }
  return { ids: uniq(ids), unknown: uniq(unknown) }
}

export function parseCourses(text: string, m: Matcher): Profile['courses'] {
  return text.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean).map((name) => {
    const whole = resolveTerm(name, m)
    return { name, skillIds: uniq([...scanText(name, m), ...(whole ? [whole] : [])]) }
  })
}

export function parseProjects(text: string, m: Matcher): Profile['projects'] {
  return text.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean).map((part) => {
    const cut = part.split(/\s[—-]\s|:\s/)
    const name = cut.length > 1 ? cut[0] : part.split(/\s+/).slice(0, 6).join(' ')
    return { name, desc: part, skillIds: scanText(part, m) }
  })
}

const SKILL_LINE = /^\s*(?:technical\s+)?(?:skills|technologies|tools|languages|frameworks)[^:\-–]{0,20}[:\-–]\s*(.+)$/i

export function cvUnknown(text: string, m: Matcher): string[] {
  const out: string[] = []
  for (const line of text.split('\n')) {
    const hit = SKILL_LINE.exec(line)
    if (!hit) continue
    for (const p of hit[1].split(/[,;|•]+/).map((s) => s.trim())) {
      if (p.length >= 2 && p.length <= 30 && p.split(/\s+/).length <= 4 && !/[@\d]{3,}/.test(p) && !resolveTerm(p, m)) out.push(p)
    }
  }
  return uniq(out)
}
