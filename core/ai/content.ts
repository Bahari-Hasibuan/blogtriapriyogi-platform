export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

export function generateExcerpt(content: string) {
  return content.slice(0, 120) + "..."
}

export function generateTags(text: string) {
  return text
    .toLowerCase()
    .split(" ")
    .filter(word => word.length > 4)
    .slice(0, 5)
}
