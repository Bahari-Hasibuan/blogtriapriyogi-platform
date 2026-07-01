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
