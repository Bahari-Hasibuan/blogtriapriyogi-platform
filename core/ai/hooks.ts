export function onPostCreateAI(post: any) {
  return {
    suggestion: "Add SEO title",
    summary: post.content?.slice(0, 100),
    tags: []
  }
}

export function onPostUpdateAI(post: any) {
  return {
    improveReadability: true,
    seoScore: 85
  }
}
