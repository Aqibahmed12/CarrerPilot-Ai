import 'dotenv/config'
import { createHash } from 'node:crypto'
import fs from 'node:fs'

export type Task = 'recs' | 'extract'

const SYS: Record<Task, string> = {
  recs: `You suggest portfolio projects. Return ONLY JSON: {"projects":[{"title":"","pitch":"","skillIds":[]}]}. Give exactly 2 projects. Each uses the target skill plus skills the student already has. Each can be built in 6-10 hours. pitch <= 25 words. Do not invent job requirements or URLs.`,
  extract: `Extract skills/tools/technologies from the text. Return ONLY JSON: {"skills":["..."]}. Max 40 items, canonical names, no soft skills, no duplicates.`,
}

const CACHE = 'data/generated/llm-cache.json'
const cache: Record<string, unknown> = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Provider = { name: string; base: string; key?: string; model?: string }

function providers(): Provider[] {
  const gemini = { name: 'gemini', base: 'https://generativelanguage.googleapis.com/v1beta/openai', key: process.env.GEMINI_API_KEY, model: process.env.LLM_MODEL_GEMINI }
  const groq = { name: 'groq', base: 'https://api.groq.com/openai/v1', key: process.env.GROQ_API_KEY, model: process.env.LLM_MODEL_GROQ ?? 'qwen/qwen3-32b' }
  return (process.env.LLM_PROVIDER === 'groq' ? [groq, gemini] : [gemini, groq]).filter((p) => p.key && p.model)
}

export const llmAvailable = () => providers().length > 0

async function chat(p: Provider, system: string, user: string): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${p.base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p.key}` },
      body: JSON.stringify({
        model: p.model,
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
    })
    if (res.status === 429 || res.status >= 500) {
      await sleep(500 * 2 ** attempt)
      continue
    }
    if (!res.ok) throw new Error(`${p.name} ${res.status}`)
    const json = (await res.json()) as { choices: { message: { content: string } }[] }
    return json.choices[0].message.content
  }
  throw new Error(`${p.name} unavailable`)
}

const parse = (raw: string): unknown =>
  JSON.parse(raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```(?:json)?/g, '').trim())

export async function callLLM(task: Task, input: string): Promise<unknown | null> {
  const key = createHash('sha1').update(task + input).digest('hex')
  if (key in cache) return cache[key]
  for (const p of providers()) {
    try {
      const data = parse(await chat(p, SYS[task], p.name === 'groq' ? `${input}\n/no_think` : input))
      cache[key] = data
      fs.writeFileSync(CACHE, JSON.stringify(cache))
      return data
    } catch {
      /* try next provider */
    }
  }
  return null
}
