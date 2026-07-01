export type PostStatus = "draft" | "published" | "archived"

export const isPublished = (status: PostStatus) => status === "published"
