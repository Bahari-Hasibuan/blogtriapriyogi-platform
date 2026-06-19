import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type DnsAnswer = {
  name?: string;
  type?: number;
  TTL?: number;
  data?: string;
};

type DnsResponse = {
  Status?: number;
  Answer?: DnsAnswer[];
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function cleanDnsValue(value: string) {
  return String(value || "")
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function cleanTxtValue(value: string) {
  return String(value || "")
    .replaceAll('" "', "")
    .replaceAll('"', "")
    .trim()
    .toLowerCase();
}

function getApex(hostname: string) {
  const parts = String(hostname || "").split(".").filter(Boolean);

  if (parts.length <= 2) return hostname;

  return parts.slice(-2).join(".");
}

async function queryDns(name: string, type: "A" | "CNAME" | "TXT") {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
    name
  )}&type=${type}`;

  const result = await fetch(url, {
    headers: {
      accept: "application/dns-json",
    },
    cache: "no-store",
  });

  if (!result.ok) return [];

  const data = (await result.json()) as DnsResponse;

  return data.Answer || [];
}

async function hasTxtVerification(hostname: string, expectedValue: string) {
  const apex = getApex(hostname);

  const namesToCheck = Array.from(
    new Set([`_triapriyogi.${hostname}`, `_triapriyogi.${apex}`])
  );

  const expected = expectedValue.toLowerCase();

  for (const name of namesToCheck) {
    const records = await queryDns(name, "TXT");

    const ok = records.some((record) => {
      return cleanTxtValue(record.data || "").includes(expected);
    });

    if (ok) return true;
  }

  return false;
}

async function hasTargetRecord(
  hostname: string,
  type: string | null,
  expectedValue: string | null
) {
  const cleanType = String(type || "").toUpperCase();
  const expected = cleanDnsValue(expectedValue || "");

  if (!hostname || !cleanType || !expected) return false;

  if (cleanType === "A") {
    const records = await queryDns(hostname, "A");

    return records.some((record) => cleanDnsValue(record.data || "") === expected);
  }

  if (cleanType === "CNAME") {
    const records = await queryDns(hostname, "CNAME");

    return records.some((record) => {
      return cleanDnsValue(record.data || "") === expected;
    });
  }

  return false;
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ ok: false, message: "Environment server belum lengkap." }, 500);
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

  const body = await request.json().catch(() => ({}));
  const domainId = String(body.domainId || "").trim();

  if (!domainId) {
    return json({ ok: false, message: "ID domain tidak ditemukan." }, 400);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const domainResult = await serviceClient
    .from("site_domains")
    .select("id,user_id,hostname,domain_type,status,verification_token,verification_record_name,dns_record_type,dns_record_name,dns_record_value")
    .eq("id", domainId)
    .eq("user_id", userResult.data.user.id)
    .maybeSingle();

  if (domainResult.error || !domainResult.data) {
    return json({ ok: false, message: "Domain tidak ditemukan." }, 404);
  }

  const domain = domainResult.data;

  if (domain.domain_type !== "custom_domain") {
    return json({ ok: false, message: "Alamat bawaan tidak perlu dicek DNS." }, 400);
  }

  const expectedTxt = `triapriyogi-verify=${domain.verification_token}`;

  const txtOk = await hasTxtVerification(domain.hostname, expectedTxt);
  const targetOk = await hasTargetRecord(
    domain.hostname,
    domain.dns_record_type,
    domain.dns_record_value
  );

  const errors: string[] = [];

  if (!txtOk) {
    errors.push("TXT verifikasi belum ditemukan.");
  }

  if (!targetOk) {
    errors.push(`${domain.dns_record_type} tujuan belum sesuai.`);
  }

  const nextStatus = txtOk && targetOk ? "active" : "needs_dns";

  const updated = await serviceClient
    .from("site_domains")
    .update({
      status: nextStatus,
      verified_at: nextStatus === "active" ? new Date().toISOString() : null,
      last_checked_at: new Date().toISOString(),
      error_message: errors.length ? errors.join(" ") : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", domain.id)
    .eq("user_id", domain.user_id)
    .select("id,hostname,status,error_message,last_checked_at,verified_at")
    .single();

  if (updated.error) {
    return json({ ok: false, message: updated.error.message }, 500);
  }

  return json({
    ok: true,
    message:
      nextStatus === "active"
        ? "DNS sudah benar. Domain aktif."
        : "DNS belum lengkap. Periksa kembali record yang diminta.",
    checks: {
      txtOk,
      targetOk,
    },
    domain: updated.data,
  });
}
