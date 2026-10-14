import express from 'express'
import { callLLM, type Task } from './core'

const app = express()
app.use(express.json({ limit: '100kb' }))

app.post('/api/llm', async (req, res) => {
  const { task, input } = (req.body ?? {}) as { task?: string; input?: unknown }
  if ((task !== 'recs' && task !== 'extract') || typeof input !== 'string') {
    res.status(400).json({ ok: false })
    return
  }
  const data = await callLLM(task as Task, input.slice(0, 3000))
  if (data) res.json({ ok: true, data })
  else res.status(503).json({ ok: false })
})

app.listen(8787, () => console.log('llm proxy on :8787'))
