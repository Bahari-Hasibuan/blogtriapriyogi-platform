"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type SiteDomainItem = {
  id: string;
  domain_type: "system_subdomain" | "custom_domain";
  hostname: string;
  status: string;
  is_primary: boolean;
  verification_token?: string | null;
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function cleanHostname(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "")
    .replaceAll("/", "");
}

function isReserved(value: string) {
  return new Set([
    "www",
    "studio",
    "admin",
    "api",
    "auth",
    "login",
    "signup",
    "dashboard",
    "editor",
    "settings",
    "mail",
    "support",
    "help",
    "terms",
    "privacy",
  ]).has(value);
}

export default function DomainSettings() {
  const [userId, setUserId] = useState("");
  const [blogName, setBlogName] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [domains, setDomains] = useState<SiteDomainItem[]>([]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    setUserId(data.user.id);

    const profile = await supabase
      .from("profiles")
      .select("blog_name, blog_slug")
      .eq("id", data.user.id)
      .single();

    if (profile.data) {
      setBlogName(profile.data.blog_name || "Platform saya");
      setBlogSlug(profile.data.blog_slug || "");
      setSlugInput(profile.data.blog_slug || "");
    }

    const domainRows = await supabase
      .from("site_domains")
      .select("id,domain_type,hostname,status,is_primary,verification_token")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false });

    if (domainRows.data) {
      setDomains(domainRows.data as SiteDomainItem[]);
    }
  }

  async function savePublicAddress() {
    const nextSlug = makeSlug(slugInput);

    if (nextSlug.length < 3) {
      setNotice("Alamat minimal 3 karakter.");
      return;
    }

    if (isReserved(nextSlug)) {
      setNotice("Alamat ini dipakai sistem. Pilih nama lain.");
      return;
    }

    setSaving(true);
    setNotice("");

    const taken = await supabase
      .from("profiles")
      .select("id")
      .eq("blog_slug", nextSlug)
      .neq("id", userId)
      .maybeSingle();

    if (taken.data?.id) {
      setSaving(false);
      setNotice("Alamat ini sudah dipakai pengguna lain.");
      return;
    }

    const updateProfile = await supabase
      .from("profiles")
      .update({
        blog_slug: nextSlug,
        blog_slug_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateProfile.error) {
      setSaving(false);
      setNotice("Gagal menyimpan alamat.");
      return;
    }

    await supabase
      .from("site_domains")
      .delete()
      .eq("user_id", userId)
      .eq("domain_type", "system_subdomain");

    await supabase.from("site_domains").insert({
      user_id: userId,
      domain_type: "system_subdomain",
      hostname: `${nextSlug}.triapriyogi.com`,
      status: "active",
      is_primary: true,
    });

    setBlogSlug(nextSlug);
    setSlugInput(nextSlug);
    setSaving(false);
    setNotice("Alamat platform berhasil disimpan.");
    await load();
  }

  async function addCustomDomain() {
    const hostname = cleanHostname(customInput);

    if (!hostname.includes(".")) {
      setNotice("Domain pribadi belum valid. Contoh: brandanda.com");
      return;
    }

    if (hostname === "triapriyogi.com" || hostname.endsWith(".triapriyogi.com")) {
      setNotice("Alamat triapriyogi.com diatur dari kolom alamat platform, bukan domain pribadi.");
      return;
    }

    setSaving(true);
    setNotice("");

    const result = await supabase.from("site_domains").insert({
      user_id: userId,
      domain_type: "custom_domain",
      hostname,
      status: "pending",
      is_primary: false,
    });

    if (result.error) {
      setSaving(false);
      setNotice("Gagal menambahkan domain. Mungkin sudah dipakai akun lain.");
      return;
    }

    setCustomInput("");
    setSaving(false);
    setNotice("Domain pribadi ditambahkan. Silakan pasang kode verifikasi DNS.");
    await load();
  }

  async function removeDomain(id: string) {
    await supabase.from("site_domains").delete().eq("id", id);
    setNotice("Domain dihapus.");
    await load();
  }

  return (
    <section className="dash-content">
      <div className="dash-title">
        <div>
          <p>Domain</p>
          <h1>Alamat platform</h1>
          <span>
            Atur alamat publik, domain pribadi, dan verifikasi DNS untuk website pengguna.
          </span>
        </div>
      </div>

      {notice && <div className="domain-notice">{notice}</div>}

      <div className="dash-grid-two">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <p>Alamat bawaan</p>
              <h2>Nama / brand / bisnis / website</h2>
            </div>
          </div>

          <div className="domain-manager">
            <label>
              Nama alamat
              <div className="domain-inline-input">
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(makeSlug(e.target.value))}
                  placeholder="contoh: andi, tokokita, studio-kopi"
                />
                <span>.triapriyogi.com</span>
              </div>
              <small>
                Gunakan nama singkat yang mudah diingat. Contoh: andi.triapriyogi.com
              </small>
            </label>

            <div className="domain-preview-card">
              <small>Alamat aktif</small>
              <b>{blogSlug || slugInput || "nama-anda"}.triapriyogi.com</b>
              <span>Halaman publik untuk {blogName || "website pengguna"}.</span>
            </div>

            <button onClick={savePublicAddress} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan alamat"}
            </button>
          </div>
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <p>Domain pribadi</p>
              <h2>Hubungkan domain sendiri</h2>
            </div>
          </div>

          <div className="domain-manager">
            <label>
              Nama domain
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="contoh: brandanda.com"
              />
              <small>
                Cocok untuk pengguna yang sudah punya domain sendiri.
              </small>
            </label>

            <div className="domain-dns-box">
              <b>Server tujuan</b>
              <span>Type: CNAME</span>
              <span>Host: www atau subdomain pilihan</span>
              <span>Target: connect.triapriyogi.com</span>
            </div>

            <button onClick={addCustomDomain} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah domain pribadi"}
            </button>
          </div>
        </article>
      </div>

      <article className="dash-panel">
        <div className="dash-panel-head">
          <div>
            <p>Verifikasi DNS</p>
            <h2>Domain tersimpan</h2>
          </div>
        </div>

        {domains.length > 0 ? (
          <div className="domain-table">
            {domains.map((item) => (
              <div key={item.id} className="domain-row-pro">
                <div className="domain-row-main">
                  <div>
                    <b>{item.hostname}</b>
                    <small>
                      {item.domain_type === "system_subdomain"
                        ? "Alamat bawaan"
                        : "Domain pribadi"}
                    </small>
                  </div>

                  <span className={`domain-status ${item.status}`}>
                    {item.status === "active"
                      ? "aktif"
                      : item.status === "verified"
                      ? "terverifikasi"
                      : "menunggu verifikasi"}
                  </span>
                </div>

                {item.domain_type === "custom_domain" && (
                  <div className="dns-verification-card">
                    <div>
                      <b>Tambahkan record TXT</b>
                      <small>Gunakan kode ini untuk membuktikan bahwa domain milik Anda.</small>
                    </div>

                    <div className="dns-code-grid">
                      <span>Type</span>
                      <code>TXT</code>

                      <span>Name</span>
                      <code>_triapriyogi</code>

                      <span>Value</span>
                      <code>triapriyogi-verify={item.verification_token}</code>
                    </div>

                    <div className="dns-code-grid">
                      <span>Server</span>
                      <code>connect.triapriyogi.com</code>
                    </div>

                    <button onClick={() => removeDomain(item.id)}>
                      Hapus domain
                    </button>
                  </div>
                )}

                {item.domain_type === "system_subdomain" && (
                  <div className="dns-simple-card">
                    <b>Siap digunakan</b>
                    <small>Alamat bawaan tidak perlu verifikasi DNS manual.</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <b>Belum ada domain tersimpan.</b>
            <small>Simpan alamat bawaan atau tambahkan domain pribadi.</small>
          </div>
        )}
      </article>
    </section>
  );
}
