import { Stage } from '../ui/Stage'
import { Headline } from '../ui/Headline'
import { useApp } from '../lib/store'

export default function Prologue() {
  const go = useApp((s) => s.go)
  const loadZara = useApp((s) => s.loadZara)
  return (
    <Stage num="00">
      <Headline lines={['Know the distance', 'between where you are', "and *where you're going.*"]} />
      <div className="mt-12 flex items-center gap-8">
        <button className="btn-primary" onClick={() => go(1)}>Begin</button>
        <button className="link-draw cursor-pointer bg-transparent p-0 text-[15px]" onClick={() => { loadZara(); go(1) }}>Load Zara</button>
      </div>
    </Stage>
  )
}
