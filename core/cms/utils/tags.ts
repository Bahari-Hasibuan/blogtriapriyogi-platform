export function extractTags(content: string) {
  const words = content.toLowerCase().split(" ")
  const stopwords = ["the", "and", "is", "in", "on", "of", "a"]

  return [...new Set(
    words.filter(w => w.length > 4 && !stopwords.includes(w))
  )].slice(0, 10)
}
