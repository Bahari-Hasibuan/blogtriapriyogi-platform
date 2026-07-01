export function generateSEO(post: any) {
  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    slug: post.slug,
    keywords: post.tags || []
  }
}
