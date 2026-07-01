let DRAFTS: Record<string, any> = {}

export function saveDraft(id: string, data: any) {
  DRAFTS[id] = {
    ...data,
    savedAt: new Date().toISOString()
  }
  return DRAFTS[id]
}

export function getDraft(id: string) {
  return DRAFTS[id]
}
