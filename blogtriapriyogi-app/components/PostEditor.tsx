"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Tab = "write" | "settings" | "preview";

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function getYouTubeId(value: string) {
  const input = String(value || "").trim();

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

function renderContent(value: string) {
  return String(value || "")
    .split("
")
    .map((rawLine) => {
      const line = rawLine.trim();

      if (line.startsWith("@youtube ")) {
        const url = line.replace("@youtube ", "").trim();
        const id = getYouTubeId(url);

        if (!id) {
          return `<p>${escapeHtml(rawLine)}</p>`;
        }

        return `<div class="embed-video"><iframe src="https://www.youtube.com/embed/${escapeAttr(id)}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
      }

      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);

      if (imageMatch) {
        const alt = imageMatch[1] || "Gambar artikel";
        const src = imageMatch[2] || "";

        return `<figure class="article-image"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
      }

      const escaped = escapeHtml(rawLine);

      if (rawLine.startsWith("### ")) return `<h3>${escapeHtml(rawLine.replace("### ", ""))}</h3>`;
      if (rawLine.startsWith("## ")) return `<h2>${escapeHtml(rawLine.replace("## ", ""))}</h2>`;
      if (rawLine.startsWith("> ")) return `<blockquote>${escapeHtml(rawLine.replace("> ", ""))}</blockquote>`;
      if (rawLine.startsWith("- ")) return `<p>• ${escapeHtml(rawLine.replace("- ", ""))}</p>`;
      if (!rawLine.trim()) return "<br />";
      return `<p>${escaped}</p>`;
    })
    .join("");
}

export default function PostEditor() {
  const router = useRouter();
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [postId, setPostId] = useState("");
  const [email, setEmail] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogName, setBlogName] = useState("");

  const [tab, setTab] = useState<Tab>("write");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("artikel-baru");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const publicUrl = useMemo(() => {
    const activeSlug = makeSlug(slug || title || "artikel-baru");
    const activeSite = blogSlug || "nama-anda";
    return `https://${activeSite}.triapriyogi.com/${activeSlug}.html`;
  }, [blogSlug, slug, title]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.replace("https://triapriyogi.com/login");
        return;
      }

      setEmail(data.user.email || "");

      const profile = await supabase
        .from("profiles")
        .select("blog_name, blog_slug")
        .eq("id", data.user.id)
        .single();

      const activeBlogSlug = profile.data?.blog_slug || "";
      const activeBlogName = profile.data?.blog_name || "Platform saya";

      if (!activeBlogSlug) {
        router.replace("/onboarding");
        return;
      }

      setBlogSlug(activeBlogSlug);
      setBlogName(activeBlogName);

      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (id) {
        const post = await supabase
          .from("posts")
          .select("id,title,slug,excerpt,content,seo_title,seo_description,status")
          .eq("id", id)
          .eq("user_id", data.user.id)
          .single();

        if (post.data) {
          setPostId(post.data.id);
          setTitle(post.data.title || "");
          setSlug(post.data.slug || "artikel-baru");
          setExcerpt(post.data.excerpt || "");
          setContent(post.data.content || "");
          setSeoTitle(post.data.seo_title || "");
          setSeoDescription(post.data.seo_description || "");
        }
      }

      setReady(true);
    }

    load();
  }, [router]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!postId && (!slug || slug === "artikel-baru")) {
      setSlug(makeSlug(value) || "artikel-baru");
    }
  }

  function insertText(before: string, after = "") {
    const el = textRef.current;

    if (!el) {
      setContent((current) => `${current}${before}${after}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const next =
      content.slice(0, start) +
      before +
      (selected || "") +
      after +
      content.slice(end);

    setContent(next);

    setTimeout(() => {
      el.focus();
      const cursor = start + before.length + (selected || "").length;
      el.setSelectionRange(cursor, cursor);
    }, 0);
  }



  async function compressImageToWebP(file: File) {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
      image.src = objectUrl;
    });

    const maxWidth = 1600;
    const maxHeight = 1600;

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      throw new Error("Browser tidak mendukung kompres gambar.");
    }

    ctx.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(objectUrl);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.78);
    });

    if (!blob) {
      throw new Error("Gagal mengubah gambar ke WebP.");
    }

    return new File(
      [blob],
      `${file.name.replace(/\.[^/.]+$/, "") || "gambar"}.webp`,
      { type: "image/webp" }
    );
  }


  async function uploadImage(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage("Ukuran gambar terlalu besar. Maksimal upload awal 15 MB.");
      return;
    }

    setSaving(true);
    setMessage("Mengoptimalkan gambar...");

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setSaving(false);
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    let optimizedFile: File;

    try {
      optimizedFile = await compressImageToWebP(file);
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Gagal mengoptimalkan gambar.");
      return;
    }

    if (optimizedFile.size > 2 * 1024 * 1024) {
      setSaving(false);
      setMessage("Gambar masih terlalu besar setelah dikompres. Gunakan gambar yang lebih ringan.");
      return;
    }

    setMessage("Mengunggah gambar...");

    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    const path = `${data.user.id}/${Date.now()}-${safeName || "gambar"}.webp`;

    const uploaded = await supabase.storage
      .from("article-media")
      .upload(path, optimizedFile, {
        cacheControl: "31536000",
        upsert: false,
        contentType: "image/webp",
      });

    if (uploaded.error) {
      setSaving(false);
      setMessage(`Gagal upload gambar: ${uploaded.error.message}`);
      return;
    }

    const publicUrl = supabase.storage
      .from("article-media")
      .getPublicUrl(path).data.publicUrl;

    insertText(`\n\n![${safeName || "Gambar artikel"}](${publicUrl})\n\n`);

    setSaving(false);
    setMessage(`Gambar berhasil dikompres dan dimasukkan. Ukuran akhir: ${Math.round(optimizedFile.size / 1024)} KB.`);
  }

  function insertYouTubeVideo() {
    const url = window.prompt("Masukkan link YouTube:");

    if (!url) return;

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      setMessage("Link YouTube belum valid.");
      return;
    }

    insertText(`\n\n@youtube ${url.trim()}\n\n`);
    setMessage("Video YouTube berhasil dimasukkan.");
  }


  function generateDraft() {
    const activeTitle = title.trim() || "Judul artikel Anda";
    const template = `## Pembuka

Tuliskan pembuka yang menjelaskan masalah utama pembaca dan alasan artikel ini penting.

## Inti pembahasan

- Poin penting pertama
- Poin penting kedua
- Poin penting ketiga

## Langkah praktis

Jelaskan langkah-langkah yang mudah diikuti oleh pembaca.

## Kesimpulan

Tutup artikel dengan ringkasan singkat dan ajakan untuk mengambil tindakan berikutnya.`;

    setTitle(activeTitle);
    setSlug(makeSlug(activeTitle));
    setExcerpt(
      excerpt ||
        `${activeTitle} membahas poin penting secara ringkas, jelas, dan mudah dipahami.`
    );
    setSeoTitle(seoTitle || activeTitle);
    setSeoDescription(
      seoDescription ||
        `${activeTitle} - panduan ringkas dan profesional untuk pembaca.`
    );
    setContent(content ? `${content}\n\n${template}` : template);
    setMessage("Kerangka artikel berhasil dibuat.");
  }

  async function savePost(nextStatus: "draft" | "published") {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const cleanTitle = title.trim() || "Untitled";
    let cleanSlug = makeSlug(slug || cleanTitle || "artikel-baru");

    if (!cleanSlug) cleanSlug = "artikel-baru";

    setSaving(true);
    setMessage("");

    let check = supabase
      .from("posts")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("slug", cleanSlug);

    if (postId) {
      check = check.neq("id", postId);
    }

    const taken = await check.maybeSingle();

    if (taken.data?.id) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-5)}`;
    }

    const payload = {
      user_id: data.user.id,
      title: cleanTitle,
      slug: cleanSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      status: nextStatus,
      seo_title: seoTitle.trim() || cleanTitle,
      seo_description: seoDescription.trim() || excerpt.trim(),
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (postId) {
      const result = await supabase
        .from("posts")
        .update(payload)
        .eq("id", postId)
        .eq("user_id", data.user.id)
        .select("id")
        .single();

      if (result.error) {
        setMessage("Gagal menyimpan artikel.");
        setSaving(false);
        return;
      }
    } else {
      const result = await supabase
        .from("posts")
        .insert(payload)
        .select("id")
        .single();

      if (result.error) {
        setMessage("Gagal membuat artikel baru.");
        setSaving(false);
        return;
      }

      setPostId(result.data.id);
      router.replace(`/editor?id=${result.data.id}`);
    }

    setSlug(cleanSlug);
    setSaving(false);
    setMessage(
      nextStatus === "published"
        ? "Artikel berhasil dipublikasikan."
        : "Draft berhasil disimpan."
    );
  }

  if (!ready) {
    return (
      <main className="editor-shell">
        <div className="editor-loading">Menyiapkan editor...</div>
      </main>
    );
  }

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <button className="editor-menu" onClick={() => router.push("/")}>☰</button>

        <div>
          <b>Editor post</b>
          <span>{email}</span>
        </div>

        <div className="editor-actions">
          <button onClick={generateDraft}>✦ AI Assistant</button>
          <button onClick={() => savePost("draft")} disabled={saving}>
            💾 Simpan draft
          </button>
          <button className="publish" onClick={() => savePost("published")} disabled={saving}>
            ✈ Publikasi
          </button>
        </div>
      </header>

      <section className="editor-canvas">
        <div className="editor-card">
          <div className="editor-tabs">
            <button className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>
              Tulis
            </button>
            <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
              Pengaturan
            </button>
            <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
              Preview
            </button>
          </div>

          {tab === "write" && (
            <>
              <input
                className="editor-title"
                value={title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Judul artikel..."
              />

              <div className="editor-meta">
                <span>{wordCount} kata</span>
                <span>{readTime} menit baca</span>
                <span>Slug: /{makeSlug(slug || title || "artikel-baru")}</span>
              </div>

              <div className="editor-toolbar">
                <button onClick={() => insertText("\n\n## ", "\n")}>H₂</button>
                <button onClick={() => insertText("\n\n### ", "\n")}>H₃</button>
                <button onClick={() => insertText("**", "**")}>B</button>
                <button onClick={() => insertText("_", "_")}>I</button>
                <button onClick={() => insertText("[teks link](https://contoh.com)")}>🔗</button>
                <button onClick={() => insertText("\n- ")}>☷</button>
                <button onClick={() => insertText("\n> ")}>❝</button>
                <button onClick={() => fileRef.current?.click()}>▧ Gambar</button>
                <button onClick={insertYouTubeVideo}>▶ YouTube</button>
                <button className="ai" onClick={generateDraft}>✦ Generate AI</button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.currentTarget.value = "";
                }}
              />

              <textarea
                ref={textRef}
                className="editor-body"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mulai tulis artikel Anda di sini... Contoh: ## Subjudul tulis isi artikel dengan gaya rapi, informatif, dan mudah dibaca."
              />
            </>
          )}

          {tab === "settings" && (
            <div className="editor-settings">
              <label>
                Slug URL
                <input
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="artikel-baru"
                />
              </label>

              <label>
                Ringkasan artikel
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Tulis ringkasan pendek untuk artikel ini."
                />
              </label>

              <label>
                Judul SEO
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Judul untuk mesin pencari"
                />
              </label>

              <label>
                Deskripsi SEO
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Deskripsi singkat untuk Google, Bing, dan mesin pencari lain."
                />
              </label>
            </div>
          )}

          {tab === "preview" && (
            <article className="editor-preview">
              <small>{blogName}</small>
              <h1>{title || "Judul artikel"}</h1>
              <p>{excerpt || "Ringkasan artikel akan tampil di sini."}</p>
              <div dangerouslySetInnerHTML={{ __html: renderContent(content) }} />
            </article>
          )}
        </div>

        <aside className="editor-side">
          {message && <div className="editor-message">{message}</div>}

          <div className="editor-panel">
            <p>Publikasi</p>
            <button onClick={() => savePost("draft")} disabled={saving}>💾 Simpan draft</button>
            <button className="publish" onClick={() => savePost("published")} disabled={saving}>
              ✈ Publikasikan artikel
            </button>
          </div>

          <div className="editor-panel">
            <p>Kualitas artikel</p>
            <div className={title.trim() ? "ok" : "warn"}>Judul {title.trim() ? "siap" : "belum diisi"}</div>
            <div className={excerpt.trim() ? "ok" : "warn"}>Ringkasan {excerpt.trim() ? "siap" : "belum diisi"}</div>
            <div className={content.trim().length > 120 ? "ok" : "warn"}>Isi artikel {content.trim().length > 120 ? "cukup" : "masih pendek"}</div>
            <div className={seoTitle.trim() && seoDescription.trim() ? "ok" : "warn"}>SEO {seoTitle.trim() && seoDescription.trim() ? "siap" : "belum lengkap"}</div>
          </div>

          <div className="editor-panel dark">
            <p>AI Writing</p>
            <h2>Buat draft lebih cepat.</h2>
            <span>Generate outline, intro, SEO title, meta description, dan draft awal.</span>
            <button onClick={generateDraft}>✦ Generate AI</button>
          </div>

          <div className="editor-panel">
            <p>Detail URL</p>
            <b>{publicUrl}</b>
            <a href={publicUrl} target="_blank">Buka artikel publik</a>
          </div>
        </aside>
      </section>
    </main>
  );
}
