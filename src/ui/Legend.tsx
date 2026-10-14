import { SAMPLE } from '../lib/data'
import { useApp } from '../lib/store'
import { useRole } from '../lib/hooks'
import { Badge } from './Badge'

export function Legend() {
  const chosen = useApp((s) => s.profile.roleId)
  const role = useRole()
  return (
    <div className="fixed bottom-10 left-[6vw] z-30 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Badge kind="verified" n={chosen ? role.n : undefined} />
        <Badge kind="generated" />
      </div>
      {SAMPLE && <span className="mono-label !text-text-3">Sample data · placeholder JDs</span>}
    </div>
  )
}
