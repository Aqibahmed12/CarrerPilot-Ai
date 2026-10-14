import type { CSSProperties, ReactNode } from 'react'

// Same viewBox + slice as the Thread, so anything drawn here lines up with it exactly.
export function Canvas({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg role="img" aria-label={label} className="pointer-events-none absolute inset-0 z-[15] h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      {children}
    </svg>
  )
}

// DOM layer that maps 1:1 onto the 1440x900 viewBox (slice behaviour), for text that must align with SVG.
export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" style={{ width: 'max(100vw, 160vh)', height: 'max(62.5vw, 100vh)', transform: 'translate(-50%, -50%)' }}>
      {children}
    </div>
  )
}

export const at = (x: number, y: number, w?: number): CSSProperties => ({
  position: 'absolute',
  left: `${x / 14.4}%`,
  top: `${y / 9}%`,
  ...(w ? { width: `${w / 14.4}%` } : {}),
})
