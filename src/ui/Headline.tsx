import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '../lib/motion'

function renderLine(line: string) {
  return line.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part,
  )
}

export function Headline({
  lines,
  size = 'display',
  delay = 0.15,
}: {
  lines: string[]
  size?: 'display' | 'h1'
  delay?: number
}) {
  const reduce = useReducedMotion()
  const cls = size === 'display' ? 't-display' : 't-h1'
  return (
    <h1 className={cls}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block"
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, y: 16, clipPath: 'inset(0% -10% 100% -10%)' }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, y: 0, clipPath: 'inset(-10% -10% -25% -10%)' }
          }
          transition={{ duration: reduce ? 0.3 : 0.8, ease: EASE, delay: reduce ? 0 : delay + i * 0.09 }}
        >
          {renderLine(line)}
        </motion.span>
      ))}
    </h1>
  )
}
