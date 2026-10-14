import { spawn } from 'node:child_process'

for (const cmd of ['npx vite', 'npx tsx server/llm.ts']) {
  const p = spawn(cmd, { stdio: 'inherit', shell: true })
  p.on('exit', (c) => process.exit(c ?? 0))
}
