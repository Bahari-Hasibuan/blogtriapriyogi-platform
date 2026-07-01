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
