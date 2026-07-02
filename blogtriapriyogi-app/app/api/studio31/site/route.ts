import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export async function POST(req: Request) {
  const supabase = getClient();
  const body = await req.json().catch(() => null);

  if (!body?.slug || !body?.site) {
    return NextResponse.json({ ok: false, message: "Payload tidak lengkap." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Env Supabase belum lengkap." }, { status: 200 });
  }

  const { error } = await supabase.from("studio_sites").upsert({
    slug: body.slug,
    custom_domain: body.site?.domain?.customDomain || null,
    site: body.site,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 200 });
  }

  return NextResponse.json({ ok: true, message: "Situs tersimpan ke cloud storage." });
}

export async function GET(req: Request) {
  const supabase = getClient();
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const domain = url.searchParams.get("domain");

  if (!supabase) {
    return NextResponse.json({ ok: false, site: null, message: "Env Supabase belum lengkap." }, { status: 200 });
  }

  let query = supabase.from("studio_sites").select("site").limit(1);

  if (slug) query = query.eq("slug", slug);
  if (domain) query = query.eq("custom_domain", domain);

  const { data, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, site: null, message: error.message }, { status: 200 });
  }

  return NextResponse.json({ ok: true, site: data?.site || null });
}
