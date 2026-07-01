export async function generateArticle(prompt: string) {
  return {
    title: "AI Generated Title: " + prompt,
    content: "This is AI generated content based on: " + prompt,
    excerpt: "Auto generated excerpt",
    tags: ["ai", "auto", "cms"]
  }
}

export async function improveSEO(text: string) {
  return {
    optimized: text + " (SEO optimized)",
    score: 92
  }
}
