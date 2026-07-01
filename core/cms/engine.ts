import type {
  Category,
  CMSSettings,
  CreatePostInput,
  Page,
  PageStatus,
  Post,
  PostStatus,
  Tag,
  UpdatePostInput,
} from "./schema";

type CMSDatabase = {
  posts: Post[];
  pages: Page[];
  categories: Category[];
  tags: Tag[];
  settings: CMSSettings;
};

declare global {
  var __BLOGTRIAP_CMS_V2_DB__: CMSDatabase | undefined;
}

function now(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function makeSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "untitled";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function createInitialDatabase(): CMSDatabase {
  const createdAt = now();

  return {
    posts: [],
    pages: [],
    categories: [],
    tags: [],
    settings: {
      siteName: "Blogtriapriyogi Platform",
      siteDescription: "CORE LOCK v2 CMS SYSTEM",
      defaultAuthorId: "system",
      updatedAt: createdAt,
    },
  };
}

const DB: CMSDatabase =
  globalThis.__BLOGTRIAP_CMS_V2_DB__ ?? createInitialDatabase();

globalThis.__BLOGTRIAP_CMS_V2_DB__ = DB;

export function getPosts(): Post[] {
  return [...DB.posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAllPosts(): Post[] {
  return getPosts();
}

export function listPosts(): Post[] {
  return getPosts();
}

export function getPublishedPosts(): Post[] {
  return getPosts().filter((post) => post.status === "published");
}

export function getPostById(id: string): Post | undefined {
  return DB.posts.find((post) => post.id === id);
}

export function getPostBySlug(slug: string): Post | undefined {
  return DB.posts.find((post) => post.slug === slug);
}

export function createPost(input: CreatePostInput): Post {
  const createdAt = now();
  const status: PostStatus = input.status ?? "draft";

  const post: Post = {
    id: makeId("post"),
    title: input.title,
    slug: input.slug ? makeSlug(input.slug) : makeSlug(input.title),
    content: input.content,
    excerpt: input.excerpt ?? "",
    coverImage: input.coverImage ?? "",
    tags: unique(input.tags ?? []),
    categoryIds: unique(input.categoryIds ?? []),
    authorId: input.authorId ?? DB.settings.defaultAuthorId,
    status,
    createdAt,
    updatedAt: createdAt,
    publishedAt: status === "published" ? createdAt : null,
    seoTitle: input.seoTitle ?? input.title,
    seoDescription: input.seoDescription ?? input.excerpt ?? "",
    readingTime: readingTime(input.content),
    featured: input.featured ?? false,
  };

  DB.posts.unshift(post);
  return post;
}

export function updatePost(id: string, input: UpdatePostInput): Post | null {
  const index = DB.posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return null;
  }

  const current = DB.posts[index];

  if (!current) {
    return null;
  }

  const status: PostStatus = input.status ?? current.status;
  const content = input.content ?? current.content;
  const title = input.title ?? current.title;

  const updatedPost: Post = {
    id: current.id,
    title,
    slug: input.slug ? makeSlug(input.slug) : current.slug,
    content,
    excerpt: input.excerpt ?? current.excerpt,
    coverImage: input.coverImage ?? current.coverImage,
    tags: input.tags ? unique(input.tags) : current.tags,
    categoryIds: input.categoryIds ? unique(input.categoryIds) : current.categoryIds,
    authorId: input.authorId ?? current.authorId,
    status,
    createdAt: current.createdAt,
    updatedAt: now(),
    publishedAt:
      status === "published" ? current.publishedAt ?? now() : current.publishedAt,
    seoTitle: input.seoTitle ?? current.seoTitle,
    seoDescription: input.seoDescription ?? current.seoDescription,
    readingTime: readingTime(content),
    featured: input.featured ?? current.featured,
  };

  DB.posts[index] = updatedPost;
  return updatedPost;
}

export function publishPost(id: string): Post | null {
  return updatePost(id, {
    status: "published",
  });
}

export function deletePost(id: string): boolean {
  const before = DB.posts.length;
  DB.posts = DB.posts.filter((post) => post.id !== id);
  return DB.posts.length < before;
}

export function getPages(): Page[] {
  return [...DB.pages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPage(input: {
  title: string;
  slug?: string;
  content: string;
  status?: PageStatus;
}): Page {
  const createdAt = now();

  const page: Page = {
    id: makeId("page"),
    title: input.title,
    slug: input.slug ? makeSlug(input.slug) : makeSlug(input.title),
    content: input.content,
    status: input.status ?? "draft",
    createdAt,
    updatedAt: createdAt,
  };

  DB.pages.unshift(page);
  return page;
}

export function getCategories(): Category[] {
  return [...DB.categories].sort((a, b) => a.name.localeCompare(b.name));
}

export function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
}): Category {
  const createdAt = now();

  const category: Category = {
    id: makeId("cat"),
    name: input.name,
    slug: input.slug ? makeSlug(input.slug) : makeSlug(input.name),
    description: input.description ?? "",
    createdAt,
    updatedAt: createdAt,
  };

  DB.categories.push(category);
  return category;
}

export function getTags(): Tag[] {
  return [...DB.tags].sort((a, b) => a.name.localeCompare(b.name));
}

export function createTag(input: { name: string; slug?: string }): Tag {
  const createdAt = now();

  const tag: Tag = {
    id: makeId("tag"),
    name: input.name,
    slug: input.slug ? makeSlug(input.slug) : makeSlug(input.name),
    createdAt,
    updatedAt: createdAt,
  };

  DB.tags.push(tag);
  return tag;
}

export function getCMSSettings(): CMSSettings {
  return DB.settings;
}

export function updateCMSSettings(input: Partial<CMSSettings>): CMSSettings {
  DB.settings = {
    ...DB.settings,
    ...input,
    updatedAt: now(),
  };

  return DB.settings;
}
