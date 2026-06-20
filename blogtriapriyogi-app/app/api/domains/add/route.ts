import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const body = await req.json();
  const hostname = String(body.hostname || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (!hostname || !hostname.includes(".")) {
    return NextResponse.json({ ok: false, message: "Domain tidak valid." }, { status: 400 });
  }

  const userId = body.user_id;

  if (!userId) {
    return NextResponse.json({ ok: false, message: "User belum terbaca." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("site_domains")
    .insert({
      user_id: userId,
      hostname,
      status: "pending",
      domain_type: "custom_domain",
      is_primary: false
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Domain berhasil disimpan.",
    domain: data
  });
}
