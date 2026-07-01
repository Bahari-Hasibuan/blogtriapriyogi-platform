export type Role = "admin" | "author" | "viewer"

export function canEdit(role: Role) {
  return role === "admin" || role === "author"
}

export function canDelete(role: Role) {
  return role === "admin"
}
