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
      setNotice("Alamat publik minimal 3 karakter.");
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
      setNotice("Gagal menyimpan alamat publik.");
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
    setNotice("Alamat publik berhasil disimpan.");
    await load();
  }

  async function addCustomDomain() {
    const hostname = cleanHostname(customInput);

    if (!hostname.includes(".")) {
      setNotice("Custom domain belum valid. Contoh: blogbrian.com");
      return;
    }

    if (hostname === "triapriyogi.com" || hostname.endsWith(".triapriyogi.com")) {
      setNotice("Subdomain triapriyogi.com diatur lewat alamat publik, bukan custom domain.");
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
    setNotice("Custom domain ditambahkan. Arahkan DNS ke Vercel.");
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
          <h1>Alamat publik & custom domain</h1>
          <span>
            Atur alamat seperti {blogSlug || "nama"}.triapriyogi.com atau sambungkan domain sendiri.
          </span>
        </div>
      </div>

      {notice && <div className="domain-notice">{notice}</div>}

      <div className="dash-grid-two">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <p>Alamat publik</p>
              <h2>Subdomain utama</h2>
            </div>
          </div>

          <div className="domain-manager">
            <label>
              Nama alamat
              <div className="domain-inline-input">
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(makeSlug(e.target.value))}
                  placeholder="brian"
                />
                <span>.triapriyogi.com</span>
              </div>
              <small>Contoh hasil: brian.triapriyogi.com</small>
            </label>

            <div className="domain-preview-card">
              <small>Alamat aktif</small>
              <b>{blogSlug || slugInput || "nama"}.triapriyogi.com</b>
              <span>Ini halaman publik untuk {blogName || "platform pengguna"}.</span>
            </div>

            <button onClick={savePublicAddress} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan alamat publik"}
            </button>
          </div>
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <p>Custom domain</p>
              <h2>Domain sendiri</h2>
            </div>
          </div>

          <div className="domain-manager">
            <label>
              Domain pribadi
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="contoh: blogbrian.com"
              />
              <small>Custom domain akan berstatus pending sampai DNS diarahkan.</small>
            </label>

            <div className="domain-dns-box">
              <b>Instruksi DNS</b>
              <span>Type: CNAME</span>
              <span>Name: @ atau www</span>
              <span>Target: cname.vercel-dns.com</span>
            </div>

            <button onClick={addCustomDomain} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah custom domain"}
            </button>
          </div>
        </article>
      </div>

      <article className="dash-panel">
        <div className="dash-panel-head">
          <div>
            <p>Daftar</p>
            <h2>Domain tersimpan</h2>
          </div>
        </div>

        {domains.length > 0 ? (
          <div className="domain-table">
            {domains.map((item) => (
              <div key={item.id} className="domain-row">
                <div>
                  <b>{item.hostname}</b>
                  <small>
                    {item.domain_type === "system_subdomain"
                      ? "Alamat publik bawaan"
                      : "Custom domain"}
                  </small>
                </div>

                <span className={`domain-status ${item.status}`}>{item.status}</span>

                {item.domain_type === "custom_domain" ? (
                  <button onClick={() => removeDomain(item.id)}>Hapus</button>
                ) : (
                  <em>Utama</em>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <b>Belum ada domain tersimpan.</b>
            <small>Simpan alamat publik terlebih dahulu.</small>
          </div>
        )}
      </article>
    </section>
  );
}
