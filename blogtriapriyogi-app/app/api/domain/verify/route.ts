import { NextResponse } from "next/server";
import { resolveCname, resolveTxt } from "node:dns/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECT_TARGET = "connect.triapriyogi.com";
const TXT_NAME = "_triapriyogi";
const TXT_VALUE = "jskslalbdkekeb";

function cleanDomain(value: string) {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();
}

async function checkCname(domain: string) {
  const targets = [domain, `www.${domain}`];

  for (const target of targets) {
    try {
      const records = await resolveCname(target);
      const ok = records.some((record) => record.replace(/\.$/, "") === CONNECT_TARGET);

      if (ok) {
        return { ok: true, host: target, records };
      }
    } catch {}
  }

  return { ok: false, host: domain, records: [] as string[] };
}

async function checkTxt(domain: string) {
  const host = `${TXT_NAME}.${domain}`;

  try {
    const records = await resolveTxt(host);
    const flat = records.flat();
    const ok = flat.some((value) => value.includes(TXT_VALUE));

    return { ok, host, records: flat };
  } catch {
    return { ok: false, host, records: [] as string[] };
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const domain = cleanDomain(body?.domain || "");

  if (!domain || !domain.includes(".")) {
    return NextResponse.json({
      ok: false,
      message: "Domain tidak valid.",
    });
  }

  const cname = await checkCname(domain);
  const txt = await checkTxt(domain);

  return NextResponse.json({
    ok: cname.ok && txt.ok,
    message:
      cname.ok && txt.ok
        ? "DNS valid. Domain siap diaktifkan."
        : "DNS belum lengkap. Cek CNAME dan TXT.",
    required: {
      cname: {
        type: "CNAME",
        host: "www atau root sesuai DNS provider",
        value: CONNECT_TARGET,
      },
      txt: {
        type: "TXT",
        host: TXT_NAME,
        value: TXT_VALUE,
      },
    },
    result: {
      cname,
      txt,
    },
  });
}
