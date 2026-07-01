export type Role = "admin" | "editor" | "writer" | "user"

export function canEdit(role: Role) {
  return role === "admin" || role === "editor"
}

export function canPublish(role: Role) {
  return role === "admin" || role === "editor"
}

export function isAdmin(role: Role) {
  return role === "admin"
}
