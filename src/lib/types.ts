export type Cat = 'lang' | 'framework' | 'tool' | 'concept' | 'data' | 'soft'
export type Skill = { id: string; name: string; cat: Cat; aliases: string[]; prereq?: string[] }
export type ReqItem = { skillId: string; count: number; importance: number; jds: number[] }
export type RoleReq = { roleId: string; n: number; req: ReqItem[]; sources: { title: string; url: string }[] }
export type Requirements = { sample: boolean; roles: RoleReq[] }
export type Profile = {
  skills: string[]
  courses: { name: string; skillIds: string[] }[]
  projects: { name: string; desc: string; skillIds: string[] }[]
  interests: string[]
  roleId?: string
}
export type Progress = { done: string[] }
export type Resource = { id: string; skillId: string; title: string; url: string; type: 'docs' | 'course' | 'video' }
export type Project = { title: string; pitch: string; skillIds: string[] }
export type Rec = { roleId: string; skillId: string; resourceIds: string[]; projects: Project[] }
export type Layout = { w: number; h: number; nodes: Record<string, [number, number]> }
