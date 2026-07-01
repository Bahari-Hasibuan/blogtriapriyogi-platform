export async function generateSEO(title: string) {
  return {
    slug: title.toLowerCase().replaceAll(" ", "-"),
    metaTitle: title + " | Blog",
    description: "AI generated SEO description for " + title
  }
}

export async function rewriteContent(text: string) {
  return text + "\n\n(optimized by AI)"
}
