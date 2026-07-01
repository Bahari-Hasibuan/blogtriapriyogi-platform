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
