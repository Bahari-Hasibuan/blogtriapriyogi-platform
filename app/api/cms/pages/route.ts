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
