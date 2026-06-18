"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import "../../components/onboarding.css";

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export default function OnboardingPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [blogName, setBlogName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState("Personal Brand");
  const [message, setMessage] = useState("");

  const slug = useMemo(() => makeSlug(blogName || "blog-saya"), [blogName]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email || "");
      setOwnerName(
        data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          ""
      );

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, blog_name")
        .eq("id", data.user.id)
        .single();

      if (profile?.full_name) setOwnerName(profile.full_name);

      if (
        profile?.blog_name &&
        profile.blog_name !== "Blog TriApriyogi" &&
        profile.blog_name.trim().length > 2
      ) {
        router.replace("/dashboard");
        return;
      }

      setReady(true);
    }

    init();
  }, [router]);

  async function finishOnboarding() {
    if (!blogName.trim()) {
      setMessage("Nama Blog / Website / Bisnis wajib diisi.");
      return;
    }

    if (blogName.trim().length < 3) {
      setMessage("Nama Blog / Website / Bisnis minimal 3 karakter.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: ownerName.trim(),
        blog_name: blogName.trim(),
        blog_slug: slug,
        blog_category: category,
        site_description: `${blogName.trim()} adalah platform digital yang dikelola oleh ${ownerName.trim() || "pemilik akun"}.`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setSaving(false);
      setMessage("Gagal menyimpan nama blog. Coba lagi.");
      return;
    }

    localStorage.setItem("tri_blog_name", blogName.trim());
    localStorage.setItem("tri_blog_slug", slug);
    localStorage.setItem("tri_blog_category", category);

    router.replace("/dashboard");
  }

  if (!ready) {
    return (
      <main className="onboarding-loading">
        <div>
          <span>TA</span>
          <h1>Menyiapkan akun...</h1>
          <p>Mengarahkan ke ruang pembuatan blog.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <div className="onboarding-brand">
          <span>TA</span>
          <div>
            <b>Tri Apriyogi Studio</b>
            <small>Creator Platform</small>
          </div>
        </div>

        <div className="onboarding-hero">
          <p>Langkah pertama</p>
          <h1>Buat identitas platform Anda</h1>
          <span>
            Tentukan nama utama untuk blog, website, bisnis, brand, atau ruang digital Anda sebelum masuk dashboard.
          </span>
        </div>

        <div className="onboarding-form">
          <label>
            Nama pemilik / pengelola
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nama Anda"
            />
          </label>

          <label>
            Nama Blog / Website / Bisnis
            <input
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              placeholder="Contoh: Tri Apriyogi Digital"
              autoFocus
            />
          </label>

          <label>
            Jenis platform
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Personal Brand</option>
              <option>Website Bisnis</option>
              <option>Blog Profesional</option>
              <option>Edukasi / Kursus</option>
              <option>Media / Publikasi</option>
              <option>Portofolio</option>
              <option>Komunitas</option>
            </select>
          </label>

          <div className="onboarding-preview">
            <small>Preview alamat platform</small>
            <b>{slug}.triapriyogi.com</b>
          </div>

          {message && <div className="onboarding-message">{message}</div>}

          <button onClick={finishOnboarding} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan identitas dan masuk dashboard"}
          </button>

          <small className="onboarding-account">{email}</small>
        </div>
      </section>
    </main>
  );
}
