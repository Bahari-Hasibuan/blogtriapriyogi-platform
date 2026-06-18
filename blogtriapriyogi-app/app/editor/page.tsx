"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type EditorTab = "write" | "settings" | "preview";
type SaveStatus = "idle" | "saving" | "saved" | "error";

const STORAGE_KEY = "tri_editor_draft_v1";

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function readMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export default function EditorPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<EditorTab>("write");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");

  const [userName, setUserName] = useState("Kreator");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Artikel");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const minutes = useMemo(() => readMinutes(content), [content]);

  const finalSlug = slug || makeSlug(title) || "artikel-baru";
  const displayTitle = title.trim() || "Untitled";

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const userEmail = data.user.email || "";
      setEmail(userEmail);
      setUserId(data.user.id);
      setUserName(
        data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          userEmail.split("@")[0] ||
          "Kreator"
      );

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setTitle(draft.title || "");
          setSlug(draft.slug || "");
          setExcerpt(draft.excerpt || "");
          setContent(draft.content || "");
          setCategory(draft.category || "Artikel");
          setTags(draft.tags || "");
          setCoverUrl(draft.coverUrl || "");
          setSeoTitle(draft.seoTitle || "");
          setSeoDescription(draft.seoDescription || "");
        } catch {}
      }

      setReady(true);
    }

    init();
  }, [router]);

  useEffect(() => {
    if (!ready) return;

    const data = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      coverUrl,
      seoTitle,
      seoDescription,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    ready,
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    coverUrl,
    seoTitle,
    seoDescription,
  ]);

  function clearMessage() {
    setTimeout(() => setMessage(""), 2400);
  }

  async function savePost(status: "draft" | "published") {
    if (!title.trim()) {
      setMessage("Judul artikel belum diisi.");
      clearMessage();
      return;
    }

    setSaveStatus("saving");

    if (!userId) {
      setSaveStatus("error");
      setMessage("User belum terbaca. Silakan login ulang.");
      clearMessage();
      return;
    }

    const payload = {
      user_id: userId,
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      status,
      cover_image: coverUrl.trim(),
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("posts").insert(payload);

    if (error) {
      setSaveStatus("error");
      setMessage("Gagal menyimpan. Pastikan tabel posts punya kolom yang sesuai.");
      clearMessage();
      return;
    }

    setSaveStatus("saved");
    setMessage(status === "published" ? "Artikel berhasil dipublikasikan." : "Draft berhasil disimpan.");
    localStorage.removeItem(STORAGE_KEY);
    clearMessage();
  }

  function generateAIText() {
    const baseTitle = title.trim() || "Strategi Membangun Blog Profesional";
    const nextExcerpt =
      excerpt ||
      "Panduan praktis untuk membangun blog modern yang cepat, rapi, mudah dikelola, dan siap berkembang.";

    const generated = `## ${baseTitle}

Blog yang profesional bukan hanya soal tampilan. Fondasi terpentingnya adalah struktur konten yang jelas, pengalaman membaca yang nyaman, performa halaman yang cepat, dan sistem pengelolaan yang mudah digunakan.

### Mengapa struktur penting?

Struktur membantu pembaca memahami isi artikel dengan cepat. Judul, subjudul, paragraf pendek, dan alur pembahasan yang rapi akan membuat artikel terasa lebih kredibel.

### Langkah awal

Mulailah dengan menentukan topik utama, target pembaca, kata kunci, dan tujuan artikel. Setelah itu, buat outline sederhana sebelum menulis isi lengkap.

### Optimasi

Gunakan judul SEO, meta description, slug yang bersih, gambar pendukung, dan internal link agar artikel lebih mudah ditemukan.

### Kesimpulan

Konten yang baik adalah gabungan antara ide yang kuat, penyajian yang rapi, dan sistem publikasi yang konsisten.`;

    setExcerpt(nextExcerpt);
    setSeoTitle(seoTitle || baseTitle);
    setSeoDescription(seoDescription || nextExcerpt);
    setSlug(slug || makeSlug(baseTitle));
    setContent(content ? `${content}\n\n${generated}` : generated);
    setMessage("Draft AI berhasil dibuat.");
    clearMessage();
  }

  function applyFormat(mark: string) {
    if (mark === "h2") {
      setContent((prev) => `${prev}\n\n## Subjudul baru\n`);
      return;
    }

    if (mark === "h3") {
      setContent((prev) => `${prev}\n\n### Subjudul kecil\n`);
      return;
    }

    if (mark === "quote") {
      setContent((prev) => `${prev}\n\n> Kutipan penting artikel.\n`);
      return;
    }

    if (mark === "list") {
      setContent((prev) => `${prev}\n\n- Poin pertama\n- Poin kedua\n- Poin ketiga\n`);
      return;
    }

    if (mark === "image") {
      setContent((prev) => `${prev}\n\n![Deskripsi gambar](https://triapriyogi.com/og-image.jpg)\n`);
      return;
    }

    setContent((prev) => `${prev}${mark}`);
  }

  if (!ready) {
    return (
      <main className="editor-loading">
        <div>
          <span>TA</span>
          <h1>Memuat editor...</h1>
          <p>Menyiapkan ruang tulis.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="editor-page">
      <header className="editor-topbar">
        <div className="editor-left">
          <Link href="/dashboard" className="editor-icon-btn">
            ☰
          </Link>

          <div>
            <p>Editor post</p>
            <small>{email}</small>
          </div>
        </div>

        <div className="editor-actions">
          <button className="editor-ai-top" onClick={generateAIText}>
            ✦ AI Assistant
          </button>

          <button className="editor-light-btn" onClick={() => savePost("draft")}>
            💾 Simpan draft
          </button>

          <button className="editor-publish-btn" onClick={() => savePost("published")}>
            📨 Publikasi
          </button>

          <div className="editor-avatar">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {message && (
        <div className={saveStatus === "error" ? "editor-message error" : "editor-message"}>
          {message}
        </div>
      )}

      <section className="editor-shell">
        <div className="editor-main">
          <div className="editor-tabs">
            <button
              className={tab === "write" ? "active" : ""}
              onClick={() => setTab("write")}
            >
              Tulis
            </button>

            <button
              className={tab === "settings" ? "active" : ""}
              onClick={() => setTab("settings")}
            >
              Pengaturan
            </button>

            <button
              className={tab === "preview" ? "active" : ""}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </div>

          {tab === "write" && (
            <>
              <input
                className="editor-title-input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(makeSlug(e.target.value));
                  if (!seoTitle) setSeoTitle(e.target.value);
                }}
                placeholder="Judul artikel..."
              />

              <div className="editor-meta-line">
                <span>{wordCount} kata</span>
                <span>{minutes} menit baca</span>
                <span>Slug: /{finalSlug}</span>
              </div>

              <div className="editor-toolbar">
                <button onClick={() => applyFormat("h2")}>H₂</button>
                <button onClick={() => applyFormat("h3")}>H₃</button>
                <button onClick={() => applyFormat("**teks tebal**")}>B</button>
                <button onClick={() => applyFormat("_teks miring_")}>I</button>
                <button onClick={() => applyFormat("[link](https://triapriyogi.com)")}>🔗</button>
                <button onClick={() => applyFormat("list")}>☷</button>
                <button onClick={() => applyFormat("quote")}>❝</button>
                <button onClick={() => applyFormat("image")}>▧</button>
                <button className="ai" onClick={generateAIText}>✦ Generate AI</button>
              </div>

              <textarea
                className="editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mulai tulis artikel Anda di sini...

Contoh:
## Subjudul
Tulis isi artikel dengan gaya rapi, informatif, dan mudah dibaca."
              />
            </>
          )}

          {tab === "settings" && (
            <section className="editor-settings">
              <div className="editor-setting-card">
                <div className="editor-card-title">
                  <p>Identitas artikel</p>
                  <h2>Informasi utama</h2>
                </div>

                <label>
                  Slug URL
                  <input
                    value={slug}
                    onChange={(e) => setSlug(makeSlug(e.target.value))}
                    placeholder="judul-artikel"
                  />
                  <small>URL: https://triapriyogi.com/blog/{finalSlug}</small>
                </label>

                <label>
                  Ringkasan artikel
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Tulis ringkasan pendek untuk kartu artikel dan meta description."
                  />
                </label>

                <label>
                  Kategori
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Artikel</option>
                    <option>Bisnis</option>
                    <option>Teknologi</option>
                    <option>SEO</option>
                    <option>AI</option>
                    <option>Tutorial</option>
                    <option>Opini</option>
                  </select>
                </label>

                <label>
                  Tags
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="blog, seo, ai, bisnis"
                  />
                  <small>Pisahkan dengan koma.</small>
                </label>
              </div>

              <div className="editor-setting-card">
                <div className="editor-card-title">
                  <p>Media</p>
                  <h2>Gambar utama</h2>
                </div>

                <label>
                  URL cover image
                  <input
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </label>

                <div className="editor-cover-preview">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Preview cover" />
                  ) : (
                    <div>
                      <span>▧</span>
                      <b>Belum ada gambar utama</b>
                      <small>Tempel URL gambar untuk melihat preview.</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="editor-setting-card">
                <div className="editor-card-title">
                  <p>SEO</p>
                  <h2>Optimasi pencarian</h2>
                </div>

                <label>
                  SEO title
                  <input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Judul SEO"
                  />
                  <small>{seoTitle.length}/60 karakter disarankan.</small>
                </label>

                <label>
                  SEO description
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Deskripsi SEO singkat."
                  />
                  <small>{seoDescription.length}/160 karakter disarankan.</small>
                </label>

                <div className="editor-serp">
                  <small>triapriyogi.com/blog/{finalSlug}</small>
                  <b>{seoTitle || displayTitle}</b>
                  <p>
                    {seoDescription ||
                      excerpt ||
                      "Deskripsi artikel akan tampil di sini sebagai preview mesin pencari."}
                  </p>
                </div>
              </div>
            </section>
          )}

          {tab === "preview" && (
            <section className="editor-preview">
              <article>
                {coverUrl && <img src={coverUrl} alt="Cover artikel" />}

                <div className="editor-preview-meta">
                  <span>{category}</span>
                  <span>{minutes} menit baca</span>
                  <span>{wordCount} kata</span>
                </div>

                <h1>{displayTitle}</h1>

                {excerpt && <p className="lead">{excerpt}</p>}

                <div className="editor-preview-body">
                  {content ? (
                    content
                      .split("\n")
                      .map((line, index) => {
                        if (line.startsWith("### ")) {
                          return <h3 key={index}>{line.replace("### ", "")}</h3>;
                        }

                        if (line.startsWith("## ")) {
                          return <h2 key={index}>{line.replace("## ", "")}</h2>;
                        }

                        if (line.startsWith("> ")) {
                          return <blockquote key={index}>{line.replace("> ", "")}</blockquote>;
                        }

                        if (line.startsWith("- ")) {
                          return <li key={index}>{line.replace("- ", "")}</li>;
                        }

                        if (!line.trim()) {
                          return <br key={index} />;
                        }

                        return <p key={index}>{line}</p>;
                      })
                  ) : (
                    <div className="editor-empty-preview">
                      <b>Preview masih kosong.</b>
                      <small>Tulis isi artikel dulu di tab Tulis.</small>
                    </div>
                  )}
                </div>
              </article>
            </section>
          )}

        </div>

        <aside className="editor-side">
          <div className="editor-status-card">
            <div className="editor-status-top">
              <span>Status</span>
              <b>
                {saveStatus === "saving"
                  ? "Menyimpan..."
                  : saveStatus === "saved"
                  ? "Tersimpan"
                  : saveStatus === "error"
                  ? "Gagal"
                  : "Draft lokal"}
              </b>
            </div>

            <div className="editor-progress">
              <div style={{ width: `${Math.min(100, Math.max(8, wordCount / 8))}%` }} />
            </div>

            <small>
              {wordCount} kata · {minutes} menit baca
            </small>
          </div>

          <div className="editor-side-card">
            <p>Publikasi</p>
            <button className="editor-save-full" onClick={() => savePost("draft")}>
              💾 Simpan draft
            </button>
            <button className="editor-publish-full" onClick={() => savePost("published")}>
              📨 Publikasikan artikel
            </button>
          </div>

          <div className="editor-side-card">
            <p>Kualitas artikel</p>

            <div className="editor-check">
              <span>{title.trim() ? "✓" : "!"}</span>
              <div>
                <b>Judul</b>
                <small>{title.trim() ? "Sudah diisi" : "Belum diisi"}</small>
              </div>
            </div>

            <div className="editor-check">
              <span>{excerpt.trim() ? "✓" : "!"}</span>
              <div>
                <b>Ringkasan</b>
                <small>{excerpt.trim() ? "Siap untuk preview" : "Tambahkan excerpt"}</small>
              </div>
            </div>

            <div className="editor-check">
              <span>{content.trim().length > 80 ? "✓" : "!"}</span>
              <div>
                <b>Isi artikel</b>
                <small>
                  {content.trim().length > 80 ? "Konten mulai lengkap" : "Isi masih pendek"}
                </small>
              </div>
            </div>

            <div className="editor-check">
              <span>{seoTitle.trim() && seoDescription.trim() ? "✓" : "!"}</span>
              <div>
                <b>SEO</b>
                <small>
                  {seoTitle.trim() && seoDescription.trim()
                    ? "Meta sudah siap"
                    : "Lengkapi SEO title dan description"}
                </small>
              </div>
            </div>
          </div>

          <div className="editor-side-card purple">
            <p>AI writing</p>
            <h3>Buat draft lebih cepat.</h3>
            <small>
              Generate outline, intro, SEO title, meta description, dan draft artikel awal.
            </small>
            <button onClick={generateAIText}>✦ Generate AI</button>
          </div>

          <div className="editor-side-card">
            <p>Detail URL</p>
            <div className="editor-url-box">
              <small>URL artikel</small>
              <b>triapriyogi.com/blog/{finalSlug}</b>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
