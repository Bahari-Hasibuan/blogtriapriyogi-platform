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
