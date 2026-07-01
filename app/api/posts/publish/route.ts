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
