import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function middleware(req: any) {
  const host = req.headers.get("host");

  if (!host) return NextResponse.next();

  // skip domain utama
  if (host.includes("triapriyogi.com")) {
    return NextResponse.next();
  }

  // NORMALIZE DOMAIN
  const cleanHost = host.replace("www.", "");

  // 🔥 lookup domain di DB
  const { data, error } = await supabase
    .from("site_domains")
    .select("user_id, hostname, status")
    .eq("hostname", cleanHost)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.rewrite(new URL("/domain-not-found", req.url));
  }

  // route ke user site
  const url = req.nextUrl.clone();
  url.pathname = `/site/${data.user_id}${url.pathname}`;

  return NextResponse.rewrite(url);
}
