"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  blog_name: string | null;
  blog_slug: string | null;
  blog_category?: string | null;
};

type DomainRow = {
  id: string;
  user_id: string;
  hostname: string;
  domain_type: "system_subdomain" | "custom_domain";
  status: "pending" | "needs_dns" | "active" | "failed" | "disabled";
  is_primary: boolean;
  verification_token: string | null;
  verification_record_name: string | null;
  dns_record_type: string | null;
  dns_record_name: string | null;
  dns_record_value: string | null;
  error_message: string | null;
  last_checked_at: string | null;
  verified_at: string | null;
};

const ROOT_DOMAIN = "triapriyogi.com";

const reservedSlugs = new Set([
  "www",
  "studio",
  "connect",
  "api",
  "admin",
  "login",
  "signup",
  "dashboard",
  "editor",
  "mail",
  "support",
  "help",
  "terms",
  "privacy",
]);

function makeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
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

function statusLabel(status: string) {
  if (status === "active") return "Aktif";
  if (status === "needs_dns") return "Perlu DNS";
  if (status === "failed") return "Bermasalah";
  if (status === "disabled") return "Nonaktif";
  return "Pending";
}

function statusClass(status: string) {
  if (status === "active") return "active";
  if (status === "failed") return "failed";
  if (status === "needs_dns") return "needs";
  return "pending";
}

export default function DomainSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [slugInput, setSlugInput] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState(false);
  const [addingDomain, setAddingDomain] = useState(false);
  const [checkingDomainId, setCheckingDomainId] = useState("");
  const [notice, setNotice] = useState("");

  const activeAddress = useMemo(() => {
    const slug = slugInput || profile?.blog_slug || "";
    return slug ? `${slug}.${ROOT_DOMAIN}` : `nama-anda.${ROOT_DOMAIN}`;
  }, [slugInput, profile?.blog_slug]);

  useEffect(() => {
    loadDomainData();
  }, []);

  async function loadDomainData() {
    setLoading(true);

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const profileResult = await supabase
      .from("profiles")
      .select("id,blog_name,blog_slug,blog_category")
      .eq("id", data.user.id)
      .single();

    if (profileResult.data) {
      setProfile(profileResult.data as Profile);
      setSlugInput(profileResult.data.blog_slug || "");
    }

    const domainsResult = await supabase
      .from("site_domains")
      .select("id,user_id,hostname,domain_type,status,is_primary,verification_token,verification_record_name,dns_record_type,dns_record_name,dns_record_value,error_message,last_checked_at,verified_at")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: true });

    if (domainsResult.data) {
      setDomains(domainsResult.data as DomainRow[]);
    }

    setLoading(false);
  }

  async function savePublicAddress() {
    const cleanSlug = makeSlug(slugInput);

    setNotice("");

    if (!cleanSlug) {
      setNotice("Nama alamat belum valid.");
      return;
    }

    if (reservedSlugs.has(cleanSlug)) {
      setNotice("Nama alamat ini dipakai sistem. Pilih nama lain.");
      return;
    }

    setSavingSlug(true);

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const hostname = `${cleanSlug}.${ROOT_DOMAIN}`;

    const taken = await supabase
      .from("profiles")
      .select("id")
      .eq("blog_slug", cleanSlug)
      .neq("id", data.user.id)
      .maybeSingle();

    if (taken.data) {
      setSavingSlug(false);
      setNotice("Nama alamat sudah digunakan akun lain.");
      return;
    }

    const profileUpdate = await supabase
      .from("profiles")
      .update({
        blog_slug: cleanSlug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);

    if (profileUpdate.error) {
      setSavingSlug(false);
      setNotice(profileUpdate.error.message);
      return;
    }

    await supabase
      .from("site_domains")
      .delete()
      .eq("user_id", data.user.id)
      .eq("domain_type", "system_subdomain");

    await supabase.from("site_domains").insert({
      user_id: data.user.id,
      domain_type: "system_subdomain",
      hostname,
      status: "active",
      is_primary: true,
      dns_record_type: "CNAME",
      dns_record_name: cleanSlug,
      dns_record_value: "cname.vercel-dns.com",
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setNotice("Alamat bawaan berhasil disimpan.");
    setSavingSlug(false);
    await loadDomainData();
  }

  async function addCustomDomain() {
    const hostname = cleanHostname(customDomain);

    setNotice("");

    if (!hostname || !hostname.includes(".")) {
      setNotice("Masukkan domain pribadi yang valid. Contoh: www.domainanda.com");
      return;
    }

    setAddingDomain(true);

    const sessionResult = await supabase.auth.getSession();
    const token = sessionResult.data.session?.access_token;

    if (!token) {
      setAddingDomain(false);
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const result = await fetch("/api/domains/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hostname }),
    });

    const json = await result.json().catch(() => null);

    setAddingDomain(false);

    if (!result.ok || !json?.ok) {
      setNotice(json?.message || "Gagal menambahkan domain pribadi.");
      return;
    }

    setCustomDomain("");
    setNotice(json.message || "Domain pribadi berhasil ditambahkan.");
    await loadDomainData();
  }


  async function checkDomainDns(domainId: string) {
    setNotice("");
    setCheckingDomainId(domainId);

    const sessionResult = await supabase.auth.getSession();
    const token = sessionResult.data.session?.access_token;

    if (!token) {
      setCheckingDomainId("");
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const result = await fetch("/api/domains/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ domainId }),
    });

    const json = await result.json().catch(() => null);

    setCheckingDomainId("");

    if (!result.ok || !json?.ok) {
      setNotice(json?.message || "Gagal mengecek DNS domain.");
      await loadDomainData();
      return;
    }

    setNotice(json.message || "DNS berhasil dicek.");
    await loadDomainData();
  }


  if (loading) {
    return (
      <section className="dash-content">
        <div className="dash-title">
          <div>
            <p>Domain</p>
            <h1>Menyiapkan pengaturan domain...</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dash-content domain-settings">
      <div className="dash-title">
        <div>
          <p>Domain</p>
          <h1>Alamat platform</h1>
          <span>Atur alamat publik, domain pribadi, dan verifikasi DNS untuk website pengguna.</span>
        </div>
      </div>

      {notice && <div className="domain-notice">{notice}</div>}

      <article className="domain-card">
        <p>Alamat bawaan</p>
        <h2>Nama / brand / bisnis / website</h2>

        <label className="domain-label">
          Nama alamat
          <div className="domain-input-suffix">
            <input
              value={slugInput}
              onChange={(event) => setSlugInput(makeSlug(event.target.value))}
              placeholder="contoh: andi, tokokita, studio-kopi"
            />
            <span>.triapriyogi.com</span>
          </div>
        </label>

        <small>Gunakan nama singkat yang mudah diingat. Contoh: andi.triapriyogi.com</small>

        <div className="domain-active-box">
          <p>Alamat aktif</p>
          <b>{activeAddress}</b>
          <span>Halaman publik untuk {profile?.blog_name || "website Anda"}.</span>
        </div>

        <button className="domain-primary-button" onClick={savePublicAddress} disabled={savingSlug}>
          {savingSlug ? "Menyimpan..." : "Simpan alamat"}
        </button>
      </article>

      <article className="domain-card">
        <p>Domain pribadi</p>
        <h2>Hubungkan domain sendiri</h2>

        <label className="domain-label">
          Nama domain
          <input
            value={customDomain}
            onChange={(event) => setCustomDomain(event.target.value)}
            placeholder="contoh: www.domainanda.com"
          />
        </label>

        <small>Cocok untuk pengguna yang sudah punya domain sendiri.</small>

        <div className="domain-dns-box">
          <b>Server tujuan</b>
          <span>Root domain: A → 76.76.21.21</span>
          <span>Subdomain / www: CNAME → connect.triapriyogi.com</span>
        </div>

        <button className="domain-primary-button" onClick={addCustomDomain} disabled={addingDomain}>
          {addingDomain ? "Menambahkan..." : "Tambah domain pribadi"}
        </button>
      </article>

      <article className="domain-card">
        <p>Verifikasi DNS</p>
        <h2>Domain tersimpan</h2>

        {domains.length === 0 ? (
          <div className="domain-empty">
            <b>Belum ada domain tersimpan.</b>
            <span>Simpan alamat bawaan atau tambahkan domain pribadi.</span>
          </div>
        ) : (
          <div className="domain-list">
            {domains.map((item) => (
              <div className="domain-row" key={item.id}>
                <div className="domain-row-head">
                  <div>
                    <b>{item.hostname}</b>
                    <span>
                      {item.domain_type === "system_subdomain"
                        ? "Alamat bawaan"
                        : "Domain pribadi"}
                    </span>
                  </div>

                  <strong className={`domain-status ${statusClass(item.status)}`}>
                    {statusLabel(item.status)}
                  </strong>
                </div>

                {item.domain_type === "custom_domain" && (
                  <div className="domain-instructions">
                    <div>
                      <p>Verifikasi kepemilikan</p>
                      <code>Type: TXT</code>
                      <code>Name: {item.verification_record_name || "_triapriyogi"}</code>
                      <code>Value: triapriyogi-verify={item.verification_token}</code>
                    </div>

                    <div>
                      <p>Arahkan domain</p>
                      <code>Type: {item.dns_record_type}</code>
                      <code>Name: {item.dns_record_name}</code>
                      <code>Value: {item.dns_record_value}</code>
                    </div>
                  </div>
                )}

                {item.domain_type === "custom_domain" && (
                  <div className="domain-actions">
                    <button
                      className="domain-secondary-button"
                      onClick={() => checkDomainDns(item.id)}
                      disabled={checkingDomainId === item.id}
                    >
                      {checkingDomainId === item.id ? "Mengecek DNS..." : "Cek DNS"}
                    </button>

                    {item.last_checked_at && (
                      <span>
                        Terakhir dicek: {new Date(item.last_checked_at).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                )}

                {item.error_message && (
                  <div className="domain-error">{item.error_message}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
