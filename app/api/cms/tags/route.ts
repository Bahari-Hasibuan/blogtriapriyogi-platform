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
