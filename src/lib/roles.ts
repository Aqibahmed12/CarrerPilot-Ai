export const ROLES = [
  { id: 'data-analyst', name: 'Data Analyst' },
  { id: 'ml-ai-engineer', name: 'ML/AI Engineer' },
  { id: 'frontend-developer', name: 'Frontend Developer' },
  { id: 'backend-developer', name: 'Backend Developer' },
] as const
export const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? id
