import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode, WheelEventHandler } from 'react'
import { EASE } from '../lib/motion'
import { Headline } from './Headline'

type Props = {
  num: string
  kicker?: string
  title?: string
  className?: string
  onWheel?: WheelEventHandler
  children?: ReactNode
}

export function Stage({ num, kicker, title, className = 'flex flex-col justify-center px-[6vw]', onWheel, children }: Props) {
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
    <motion.main {...v} onWheel={onWheel} className={`absolute inset-0 z-20 ${className}`}>
      <span aria-hidden className="numeral">{num}</span>
      {title && (
        <div className="absolute left-[6vw] top-[84px] z-20">
          {kicker && <p className="mono-label mb-2">{kicker}</p>}
          <Headline lines={[title]} size="h1" delay={0.1} />
        </div>
      )}
      {children}
    </motion.main>
  )
}
