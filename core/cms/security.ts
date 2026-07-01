export function requireRole(user: any, roles: string[]) {
  if (!user) throw new Error("unauthorized")

  if (!roles.includes(user.role)) {
    throw new Error("forbidden")
  }

  return true
}
