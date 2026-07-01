export type PostStatus = "draft" | "published" | "archived"

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  tags: string[]
  status: PostStatus

  version: number
  authorId: string

  createdAt: string
  updatedAt: string
}
