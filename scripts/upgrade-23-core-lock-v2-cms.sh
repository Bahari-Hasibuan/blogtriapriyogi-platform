set -e

echo "== Upgrade 23 CORE LOCK v2 CMS SYSTEM =="

mkdir -p core/cms
mkdir -p app/api/posts
mkdir -p app/api/posts/publish
mkdir -p app/api/cms/posts
mkdir -p app/api/cms/posts/publish
mkdir -p 'app/api/cms/posts/[id]'
mkdir -p app/api/cms/pages
mkdir -p app/api/cms/tags
mkdir -p app/api/cms/categories
mkdir -p app/api/cms/settings

cat > core/cms/schema.ts <<'TS'
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
TS

cat > core/cms/engine.ts <<'TS'
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
TS

cat > app/api/posts/route.ts <<'TS'
import { NextResponse } from "next/server";
import { createPost, getPosts } from "@/core/cms/engine";
import type { PostStatus } from "@/core/cms/schema";

export const dynamic = "force-dynamic";

function parseStatus(value: unknown): PostStatus {
  if (value === "draft" || value === "published" || value === "archived") {
    return value;
  }

  return "draft";
}

export async function GET() {
  return NextResponse.json(getPosts());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.title || !body.content) {
    return NextResponse.json(
      {
        error: "title and content are required",
      },
      {
        status: 400,
      }
    );
  }

  const post = createPost({
    title: String(body.title),
    slug: body.slug ? String(body.slug) : undefined,
    content: String(body.content),
    excerpt: body.excerpt ? String(body.excerpt) : "",
    coverImage: body.coverImage ? String(body.coverImage) : "",
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds.map(String) : [],
    authorId: body.authorId ? String(body.authorId) : "system",
    status: parseStatus(body.status),
    seoTitle: body.seoTitle ? String(body.seoTitle) : undefined,
    seoDescription: body.seoDescription ? String(body.seoDescription) : undefined,
    featured: Boolean(body.featured),
  });

  return NextResponse.json(post, {
    status: 201,
  });
}
TS

cat > app/api/cms/posts/route.ts <<'TS'
export { GET, POST, dynamic } from "@/app/api/posts/route";
TS

cat > app/api/posts/publish/route.ts <<'TS'
import { NextResponse } from "next/server";
import { publishPost } from "@/core/cms/engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.id) {
    return NextResponse.json(
      {
        error: "id is required",
      },
      {
        status: 400,
      }
    );
  }

  const post = publishPost(String(body.id));

  if (!post) {
    return NextResponse.json(
      {
        error: "post not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(post);
}
TS

cat > app/api/cms/posts/publish/route.ts <<'TS'
export { POST, dynamic } from "@/app/api/posts/publish/route";
TS

cat > 'app/api/cms/posts/[id]/route.ts' <<'TS'
import { NextResponse } from "next/server";
import { deletePost, getPostById, updatePost } from "@/core/cms/engine";
import type { PostStatus } from "@/core/cms/schema";

type RouteContext = {
  params: {
    id: string;
  };
};

function parseStatus(value: unknown): PostStatus | undefined {
  if (value === "draft" || value === "published" || value === "archived") {
    return value;
  }

  return undefined;
}

export async function GET(_req: Request, context: RouteContext) {
  const post = getPostById(context.params.id);

  if (!post) {
    return NextResponse.json(
      {
        error: "post not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(post);
}

export async function PATCH(req: Request, context: RouteContext) {
  const body = await req.json().catch(() => ({}));

  const post = updatePost(context.params.id, {
    title: body.title ? String(body.title) : undefined,
    slug: body.slug ? String(body.slug) : undefined,
    content: body.content ? String(body.content) : undefined,
    excerpt: body.excerpt ? String(body.excerpt) : undefined,
    coverImage: body.coverImage ? String(body.coverImage) : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds.map(String) : undefined,
    authorId: body.authorId ? String(body.authorId) : undefined,
    status: parseStatus(body.status),
    seoTitle: body.seoTitle ? String(body.seoTitle) : undefined,
    seoDescription: body.seoDescription ? String(body.seoDescription) : undefined,
    featured:
      typeof body.featured === "boolean" ? Boolean(body.featured) : undefined,
  });

  if (!post) {
    return NextResponse.json(
      {
        error: "post not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(post);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const deleted = deletePost(context.params.id);

  return NextResponse.json({
    deleted,
  });
}
TS

cat > app/api/cms/pages/route.ts <<'TS'
import { NextResponse } from "next/server";
import { createPage, getPages } from "@/core/cms/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPages());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.title || !body.content) {
    return NextResponse.json(
      {
        error: "title and content are required",
      },
      {
        status: 400,
      }
    );
  }

  const page = createPage({
    title: String(body.title),
    slug: body.slug ? String(body.slug) : undefined,
    content: String(body.content),
    status: body.status === "published" ? "published" : "draft",
  });

  return NextResponse.json(page, {
    status: 201,
  });
}
TS

cat > app/api/cms/categories/route.ts <<'TS'
import { NextResponse } from "next/server";
import { createCategory, getCategories } from "@/core/cms/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getCategories());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.name) {
    return NextResponse.json(
      {
        error: "name is required",
      },
      {
        status: 400,
      }
    );
  }

  const category = createCategory({
    name: String(body.name),
    slug: body.slug ? String(body.slug) : undefined,
    description: body.description ? String(body.description) : "",
  });

  return NextResponse.json(category, {
    status: 201,
  });
}
TS

cat > app/api/cms/tags/route.ts <<'TS'
import { NextResponse } from "next/server";
import { createTag, getTags } from "@/core/cms/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTags());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.name) {
    return NextResponse.json(
      {
        error: "name is required",
      },
      {
        status: 400,
      }
    );
  }

  const tag = createTag({
    name: String(body.name),
    slug: body.slug ? String(body.slug) : undefined,
  });

  return NextResponse.json(tag, {
    status: 201,
  });
}
TS

cat > app/api/cms/settings/route.ts <<'TS'
import { NextResponse } from "next/server";
import { getCMSSettings, updateCMSSettings } from "@/core/cms/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getCMSSettings());
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));

  const settings = updateCMSSettings({
    siteName: body.siteName ? String(body.siteName) : undefined,
    siteDescription: body.siteDescription ? String(body.siteDescription) : undefined,
    defaultAuthorId: body.defaultAuthorId ? String(body.defaultAuthorId) : undefined,
  });

  return NextResponse.json(settings);
}
TS

cat > CORE_LOCK_V2_CMS_SYSTEM.md <<'MD'
# CORE LOCK v2 CMS SYSTEM

Status: LOCKED

Fitur inti:
1. Posts CRUD
2. Publish post
3. Pages
4. Tags
5. Categories
6. CMS settings
7. API kompatibel:
   - /api/posts
   - /api/posts/publish
   - /api/cms/posts
   - /api/cms/posts/publish
   - /api/cms/posts/[id]
   - /api/cms/pages
   - /api/cms/tags
   - /api/cms/categories
   - /api/cms/settings

Catatan:
Core ini tidak boleh diacak ulang. Upgrade berikutnya harus menambah modul, bukan merusak core.
MD

grep -R "crypto.randomUUID()" -n app core || true

rm -rf .next node_modules/.cache

pnpm build

echo "== CORE LOCK v2 CMS SYSTEM selesai =="
