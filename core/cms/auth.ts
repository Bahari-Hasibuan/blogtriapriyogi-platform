export function canEdit(user: any) {
  return user?.role === "admin" || user?.role === "editor"
}

export function canPublish(user: any) {
  return user?.role === "admin"
}
