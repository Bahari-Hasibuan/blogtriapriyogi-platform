"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type PostItem = {
  id: string;
  title: string;
  slug: string | null;
  status: string;
  excerpt: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export default function PostsManager() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [blogSlug, setBlogSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
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
      .neq("status", "archived")
      .order("updated_at", { ascending: false });

    if (result.data) {
      setPosts(result.data as PostItem[]);
    }

    setLoading(false);
  }

  async function archivePost(id: string) {
    const result = await supabase
      .from("posts")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (result.error) {
      setNotice("Gagal mengarsipkan artikel.");
      return;
    }

    setNotice("Artikel dipindahkan ke arsip.");
    await loadPosts();
  }

  return (
    <section className="dash-content">
      <div className="dash-title">
        <div>
          <p>Postingan</p>
          <h1>Kelola artikel</h1>
          <span>Tulis, simpan draft, edit, dan publikasikan artikel ke halaman publik.</span>
        </div>

        <a className="post-new-button" href="/editor">+ Buat artikel</a>
      </div>

      {notice && <div className="domain-notice">{notice}</div>}

      <article className="dash-panel">
        <div className="dash-panel-head">
          <div>
            <p>Artikel</p>
            <h2>Semua postingan</h2>
          </div>
        </div>

        {loading ? (
          <div className="dash-empty">
            <b>Memuat artikel...</b>
          </div>
        ) : posts.length === 0 ? (
          <div className="dash-empty">
            <b>Belum ada artikel.</b>
            <small>Buat artikel pertama dari tombol Buat artikel.</small>
            <a className="post-empty-action" href="/editor">Mulai menulis</a>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => {
              const publicUrl =
                post.status === "published" && post.slug && blogSlug
                  ? `https://${blogSlug}.triapriyogi.com/${post.slug}.html`
                  : "";

              return (
                <div key={post.id} className="post-row">
                  <div>
                    <b>{post.title}</b>
                    <small>{post.excerpt || "Belum ada ringkasan artikel."}</small>
                    <span>
                      {post.status === "published" ? "Dipublikasikan" : "Draft"} ·{" "}
                      {post.slug || "belum-ada-slug"}
                    </span>
                  </div>

                  <strong className={post.status === "published" ? "published" : "draft"}>
                    {post.status === "published" ? "Published" : "Draft"}
                  </strong>

                  <div className="post-actions">
                    <a href={`/editor?id=${post.id}`}>Edit</a>
                    {publicUrl && <a href={publicUrl} target="_blank">Buka</a>}
                    <button onClick={() => archivePost(post.id)}>Arsip</button>
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
