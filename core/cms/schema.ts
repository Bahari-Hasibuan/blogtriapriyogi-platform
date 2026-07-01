export type PostStatus = "draft" | "published" | "archived";
export type PageStatus = "draft" | "published" | "archived";

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  categoryIds: string[];
  authorId: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
  featured: boolean;
};

export type CreatePostInput = {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  categoryIds?: string[];
  authorId?: string;
  status?: PostStatus;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
};

export type UpdatePostInput = {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  categoryIds?: string[];
  authorId?: string;
  status?: PostStatus;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type CMSSettings = {
  siteName: string;
  siteDescription: string;
  defaultAuthorId: string;
  updatedAt: string;
};
