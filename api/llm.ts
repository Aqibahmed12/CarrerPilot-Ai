import { callLLM, type Task } from '../server/core.js'

type Req = { method?: string; body?: unknown }
type Res = { status: (n: number) => Res; json: (b: unknown) => void }

// Vercel serverless function: POST /api/llm  { task: 'recs'|'extract', input: string }
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false })
    return
  }
  let body: { task?: string; input?: unknown } = {}
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as typeof body
  } catch {
    /* fall through to 400 */
  }
  const { task, input } = body
  if ((task !== 'recs' && task !== 'extract') || typeof input !== 'string') {
    res.status(400).json({ ok: false })
    return
  }
  const data = await callLLM(task as Task, input.slice(0, 3000))
  if (data) res.status(200).json({ ok: true, data })
  else res.status(503).json({ ok: false })
}
