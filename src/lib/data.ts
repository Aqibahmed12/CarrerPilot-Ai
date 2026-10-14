import taxonomy from '../../data/taxonomy.json'
import requirements from '../../data/generated/requirements.json'
import recs from '../../data/generated/recs.json'
import resources from '../../data/resources.curated.json'
import persona from '../../data/persona.zara.json'
import { buildMatcher } from './extract'
import type { Layout, Profile, Rec, Requirements, Resource, Skill } from './types'

export const TAX = taxonomy as unknown as Skill[]
export const SKILL = new Map(TAX.map((s) => [s.id, s]))
export const REQS = requirements as unknown as Requirements
export const SAMPLE = REQS.sample
export const RECS = recs as unknown as Rec[]
export const RESOURCES = resources as unknown as Resource[]
export const RES = new Map(RESOURCES.map((r) => [r.id, r]))
export const ZARA = persona as unknown as { name: string; profile: Profile }
export const matcher = buildMatcher(TAX)

const layouts = import.meta.glob('../../data/layouts/*.json', { eager: true, import: 'default' }) as Record<string, Layout>
export const layoutOf = (id: string): Layout | undefined => layouts[`../../data/layouts/${id}.json`]
export const roleReq = (id?: string) => REQS.roles.find((r) => r.roleId === id)
export const skillName = (id: string) => SKILL.get(id)?.name ?? id
