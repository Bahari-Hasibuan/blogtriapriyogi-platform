export function generateSEO(title: string) {
  return {
    slug: title.toLowerCase().replaceAll(" ", "-"),
    metaTitle: title,
    metaDescription: `${title} - read full article`
  }
}

export function generateDraft(topic: string) {
  return `# ${topic}\n\nGenerated draft content for ${topic}...`
}

export function rewriteContent(text: string) {
  return text + "\n\n(optimized version generated)"
}
