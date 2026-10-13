import { Stage } from '../ui/Stage'
import { Headline } from '../ui/Headline'
import { useApp } from '../lib/store'

export default function Prologue() {
  const go = useApp((s) => s.go)
  return (
    <Stage num="00">
      <Headline lines={['Know the distance', 'between where you are', "and *where you're going.*"]} />
      <div className="mt-12 flex items-center gap-8">
        <button className="btn-primary" onClick={() => go(1)}>Begin</button>
      </div>
    </Stage>
  )
}
