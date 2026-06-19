import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ROOT_DOMAIN = "triapriyogi.com";
const CONNECT_HOST = "connect.triapriyogi.com";
const ROOT_A_RECORD = "76.76.21.21";

const multiPartPublicSuffixes = new Set([
  "web.id",
  "co.id",
  "or.id",
  "ac.id",
  "sch.id",
  "my.id",
  "biz.id",
  "net.id",
  "desa.id",
  "ponpes.id",
  "go.id",
  "mil.id",
  "co.uk",
  "org.uk",
  "ac.uk",
  "com.au",
  "net.au",
  "org.au",
]);

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function cleanHostname(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .replace(/\.$/, "");
}

function isValidHostname(hostname: string) {
  if (!hostname) return false;
  if (hostname.length > 253) return false;
  if (!hostname.includes(".")) return false;
  if (hostname.includes("..")) return false;
  if (hostname.startsWith(".") || hostname.endsWith(".")) return false;

  return hostname
    .split(".")
    .every((part) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(part));
}

function rootLabelCount(hostname: string) {
  const parts = hostname.split(".");
  const lastTwo = parts.slice(-2).join(".");

  if (multiPartPublicSuffixes.has(lastTwo)) {
    return 3;
  }

  return 2;
}

function isRootDomain(hostname: string) {
  const parts = hostname.split(".");
  return parts.length === rootLabelCount(hostname);
}

function dnsTargetFor(hostname: string) {
  if (isRootDomain(hostname)) {
    return {
      dns_record_type: "A",
      dns_record_name: "@",
      dns_record_value: ROOT_A_RECORD,
    };
  }

  const parts = hostname.split(".");
  const recordName = parts.slice(0, -rootLabelCount(hostname)).join(".") || "www";

  return {
    dns_record_type: "CNAME",
    dns_record_name: recordName,
    dns_record_value: CONNECT_HOST,
  };
}

async function addDomainToVercel(hostname: string) {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return {
      ok: false,
      status: 500,
      already: false,
      message: "Environment Vercel belum lengkap.",
      data: null,
    };
  }

  const url = new URL(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/domains`
  );

  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  const result = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: hostname,
    }),
  });

  const data = await result.json().catch(() => null);

  if (result.ok) {
    return {
      ok: true,
      status: result.status,
      already: false,
      message: "Domain berhasil didaftarkan ke server tujuan.",
      data,
    };
  }

  const message =
    data?.error?.message ||
    data?.message ||
    "Gagal mendaftarkan domain ke server tujuan.";

  const lower = String(message).toLowerCase();

  if (lower.includes("already") || lower.includes("exists")) {
    return {
      ok: true,
      status: result.status,
      already: true,
      message,
      data,
    };
  }

  return {
    ok: false,
    status: result.status,
    already: false,
    message,
    data,
  };
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ ok: false, message: "Environment Supabase server belum lengkap." }, 500);
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return json({ ok: false, message: "Sesi login tidak ditemukan." }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey);
  const userResult = await authClient.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return json({ ok: false, message: "Sesi login tidak valid." }, 401);
  }

  const user = userResult.data.user;
  const body = await request.json().catch(() => ({}));
  const hostname = cleanHostname(body.hostname);

  if (!isValidHostname(hostname)) {
    return json({ ok: false, message: "Format domain belum valid." }, 400);
  }

  if (hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return json(
      {
        ok: false,
        message: "Domain pribadi harus domain milik user sendiri, bukan subdomain triapriyogi.com.",
      },
      400
    );
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const existing = await serviceClient
    .from("site_domains")
    .select("id,user_id,hostname,status,verification_token,verification_record_name,dns_record_type,dns_record_name,dns_record_value,error_message,last_checked_at,verified_at,provider_status,provider_error")
    .eq("hostname", hostname)
    .maybeSingle();

  if (existing.data) {
    if (existing.data.user_id === user.id) {
      return json({
        ok: true,
        message: "Domain sudah tersimpan.",
        domain: existing.data,
      });
    }

    return json({ ok: false, message: "Domain ini sudah digunakan akun lain." }, 409);
  }

  const providerResult = await addDomainToVercel(hostname);

  if (!providerResult.ok) {
    return json(
      {
        ok: false,
        message: `Gagal menambahkan domain ke server tujuan: ${providerResult.message}`,
        provider: providerResult.data,
      },
      providerResult.status || 500
    );
  }

  const dns = dnsTargetFor(hostname);

  const inserted = await serviceClient
    .from("site_domains")
    .insert({
      user_id: user.id,
      domain_type: "custom_domain",
      hostname,
      status: "pending",
      is_primary: false,
      verification_record_name: "_triapriyogi",
      ...dns,
      provider: "vercel",
      provider_status: providerResult.already ? "already_added" : "added",
      provider_error: null,
      provider_response: providerResult.data,
      provider_checked_at: new Date().toISOString(),
      error_message: null,
      last_checked_at: null,
      verified_at: null,
      updated_at: new Date().toISOString(),
    })
    .select("id,user_id,hostname,status,verification_token,verification_record_name,dns_record_type,dns_record_name,dns_record_value,error_message,last_checked_at,verified_at,created_at,updated_at,provider_status,provider_error")
    .single();

  if (inserted.error) {
    return json({ ok: false, message: inserted.error.message }, 500);
  }

  return json({
    ok: true,
    message: "Domain pribadi berhasil ditambahkan.",
    domain: inserted.data,
  });
}
