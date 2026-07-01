export function logAction(action: string, user: string) {
  console.log(`[AUDIT] ${action} by ${user} at ${new Date().toISOString()}`)
}
