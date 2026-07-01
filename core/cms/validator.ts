export function validatePost(data: any) {
  if (!data.title) throw new Error("title required")
  if (!data.slug) throw new Error("slug required")
  if (!data.content) throw new Error("content required")

  return {
    ...data,
    title: data.title.trim(),
    slug: data.slug.toLowerCase().replace(/\s+/g, "-")
  }
}
