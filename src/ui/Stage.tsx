import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE } from '../lib/motion'

export function Stage({ num, children }: { num: string; children: ReactNode }) {
  const reduce = useReducedMotion()
  const v = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        initial: { opacity: 0, y: 16, filter: 'blur(0px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE } },
        exit: { opacity: 0, filter: 'blur(2px)', transition: { duration: 0.35, ease: EASE } },
      }
  return (
    <motion.main {...v} className="absolute inset-0 z-20 flex flex-col justify-center px-[6vw]">
      <span aria-hidden className="numeral">{num}</span>
      {children}
    </motion.main>
  )
}
