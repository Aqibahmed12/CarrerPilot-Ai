import type { ComponentType } from 'react'
import Prologue from './Prologue'
import Origin from './Origin'
import Horizon from './Horizon'
import Map from './Map'
import Ascent from './Ascent'
import Summit from './Summit'

export const STAGES: { id: string; num: string; C: ComponentType }[] = [
  { id: 'prologue', num: '00', C: Prologue },
  { id: 'origin', num: '01', C: Origin },
  { id: 'horizon', num: '02', C: Horizon },
  { id: 'map', num: '03', C: Map },
  { id: 'ascent', num: '04', C: Ascent },
  { id: 'summit', num: '05', C: Summit },
]
