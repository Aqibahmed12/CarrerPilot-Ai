import { useMemo } from 'react'
import { RECS, REQS, RESOURCES, TAX } from './data'
import { CONTOUR, HORIZON, RING, elevPoints } from './geom'
import { buildRoadmap } from './roadmap'
import { ROLES } from './roles'
import { useApp } from './store'
import { ORIGIN, PROLOGUE, arc, hline, smooth, type ThreadPreset } from '../ui/threadPaths'

export function useRole() {
  const id = useApp((s) => s.profile.roleId) ?? 'ml-ai-engineer'
  return REQS.roles.find((r) => r.roleId === id) ?? REQS.roles[0]
}

export function useRoadmap() {
  const profile = useApp((s) => s.profile)
  const role = useRole()
  return useMemo(() => buildRoadmap(role, profile, TAX, RECS, RESOURCES), [role, profile])
}

export function useThreadPreset(): ThreadPreset {
  const stage = useApp((s) => s.stage)
  const hover = useApp((s) => s.hover)
  const rm = useRoadmap()
  return useMemo(() => {
    if (stage === 0) return PROLOGUE
    if (stage === 1) return ORIGIN
    if (stage === 2) {
      const i = hover ?? 0
      return hline(HORIZON.x, HORIZON.x + ROLES[i].name.length * 40, HORIZON.y0 + HORIZON.row * i + 106)
    }
    if (stage === 3) return arc(RING.cx, RING.cy, RING.r, 135, 270)
    if (stage === 4) return smooth(elevPoints(rm.readiness))
    return arc(CONTOUR.cx, CONTOUR.cy, CONTOUR.r, -90, 360)
  }, [stage, hover, rm])
}
