export function validatePost(data: any) {
  if (!data.title || data.title.length < 3) {
    throw new Error("Title too short")
  }

  if (!data.content || data.content.length < 10) {
    throw new Error("Content too short")
  }

  if (!data.slug) {
    throw new Error("Slug required")
  }

  return true
}
