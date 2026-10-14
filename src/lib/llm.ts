export async function llm(task: 'recs' | 'extract', input: string): Promise<unknown | null> {
  try {
    const res = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, input: input.slice(0, 3000) }),
    })
    if (!res.ok) return null
    return ((await res.json()) as { data?: unknown }).data ?? null
  } catch {
    return null
  }
}
