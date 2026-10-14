import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '../lib/motion'
import type { ThreadPreset } from './threadPaths'

export function Thread({ preset: p, pan = 0 }: { preset: ThreadPreset; pan?: number }) {
  const reduce = useReducedMotion()
  const morph = reduce ? { duration: 0 } : { duration: 0.85, ease: EASE }
  const ignite = reduce ? { duration: 0 } : { duration: 1.6, ease: EASE }
  const headT = { cx: morph, cy: morph, opacity: { duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 1.2 } }
  const head = { cx: p.x, cy: p.y, opacity: 1 }
  return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-10 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <motion.g initial={{ x: 0 }} animate={{ x: -pan }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}>
        <motion.path
          fill="none"
          stroke="var(--violet)"
          strokeWidth={1}
          strokeLinecap="round"
          initial={{ d: p.d, pathLength: reduce ? 1 : 0 }}
          animate={{ d: p.d, pathLength: 1 }}
          transition={{ d: morph, pathLength: ignite }}
        />
        <motion.circle r={16} fill="var(--violet-glow)" initial={{ cx: p.x, cy: p.y, opacity: 0 }} animate={head} transition={headT} />
        <motion.circle r={3} fill="var(--violet-hi)" initial={{ cx: p.x, cy: p.y, opacity: 0 }} animate={head} transition={headT} />
      </motion.g>
    </svg>
  )
}
