"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type PageItem = {
  id: string;
  title: string;
  slug: string | null;
  status: string;
  excerpt: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export default function PagesManager() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [blogSlug, setBlogSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const profile = await supabase
      .from("profiles")
      .select("blog_slug")
      .eq("id", data.user.id)
      .single();

    setBlogSlug(profile.data?.blog_slug || "");

    const result = await supabase
      .from("posts")
      .select("id,title,slug,status,excerpt,created_at,updated_at,published_at")
      .eq("user_id", data.user.id)
      .eq("content_type", "page")
      .neq("status", "archived")
      .order("updated_at", { ascending: false });

    if (result.data) {
      setPages(result.data as PageItem[]);
    }

    setLoading(false);
  }

  async function archivePage(id: string) {
    const result = await supabase
      .from("posts")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (result.error) {
      setNotice("Gagal mengarsipkan halaman.");
      return;
    }

    setNotice("Halaman dipindahkan ke arsip.");
    await loadPages();
  }

  return (
    <section className="dash-content">
      <div className="dash-title">
        <div>
          <p>Halaman</p>
          <h1>Kelola halaman website</h1>
          <span>Buat halaman seperti Tentang, Kontak, Layanan, Produk, Profil, dan halaman statis lainnya.</span>
        </div>

        <a className="post-new-button" href="/page-editor">+ Buat halaman</a>
      </div>

      {notice && <div className="domain-notice">{notice}</div>}

      <article className="dash-panel">
        <div className="dash-panel-head">
          <div>
            <p>Website pages</p>
            <h2>Semua halaman</h2>
          </div>
        </div>

        {loading ? (
          <div className="dash-empty">
            <b>Memuat halaman...</b>
          </div>
        ) : pages.length === 0 ? (
          <div className="dash-empty">
            <b>Belum ada halaman.</b>
            <small>Buat halaman pertama seperti Tentang, Kontak, Layanan, atau Produk.</small>
            <a className="post-empty-action" href="/page-editor">Mulai buat halaman</a>
          </div>
        ) : (
          <div className="post-list">
            {pages.map((page) => {
              const publicUrl =
                page.status === "published" && page.slug && blogSlug
                  ? `https://${blogSlug}.triapriyogi.com/${page.slug}`
                  : "";

              return (
                <div key={page.id} className="post-row">
                  <div>
                    <b>{page.title}</b>
                    <small>{page.excerpt || "Belum ada ringkasan halaman."}</small>
                    <span>
                      {page.status === "published" ? "Dipublikasikan" : "Draft"} ·{" "}
                      /{page.slug || "halaman-baru"}
                    </span>
                  </div>

                  <strong className={page.status === "published" ? "published" : "draft"}>
                    {page.status === "published" ? "Published" : "Draft"}
                  </strong>

                  <div className="post-actions">
                    <a href={`/page-editor?id=${page.id}`}>Edit</a>
                    {publicUrl && <a href={publicUrl} target="_blank">Buka</a>}
                    <button onClick={() => archivePage(page.id)}>Arsip</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}
