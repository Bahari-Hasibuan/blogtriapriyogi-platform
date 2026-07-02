"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTemplates, starterPosts, type PostItem, type TemplateItem } from "./data";
import styles from "./Studio28.module.css";

type View =
  | "dashboard"
  | "templates"
  | "editor"
  | "posts"
  | "analytics"
  | "settings"
  | "admin"
  | "profile"
  | "page-editor";

const menu = [
  ["dashboard", "▣", "Command Center", "/dashboard"],
  ["templates", "▥", "Template Market", "/templates"],
  ["editor", "✎", "Article Studio", "/editor"],
  ["posts", "☰", "Content Library", "/posts"],
  ["page-editor", "▤", "Site Builder", "/page-editor"],
  ["analytics", "◎", "Growth Analytics", "/analytics"],
  ["admin", "⚙", "Admin Control", "/admin"],
  ["profile", "◉", "Brand Profile", "/profile"],
  ["settings", "⌘", "System Settings", "/settings"],
] as const;

function getStoredPosts() {
  if (typeof window === "undefined") return starterPosts;

  const saved = window.localStorage.getItem("studio28.posts");
  if (!saved) return starterPosts;

  try {
    return JSON.parse(saved) as PostItem[];
  } catch {
    return starterPosts;
  }
}

export default function Studio28App({ view }: { view: View }) {
  const templates = useMemo(() => getTemplates(), []);
  const [closed, setClosed] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>(starterPosts);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setPosts(getStoredPosts());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studio28.posts", JSON.stringify(posts));
  }, [posts]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((item) => item.status === "Published").length;
    const draft = posts.filter((item) => item.status === "Draft").length;
    const score = Math.round(posts.reduce((sum, item) => sum + item.score, 0) / Math.max(total, 1));

    return { total, published, draft, score };
  }, [posts]);

  function saveDraft() {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert("Judul belum diisi.");
      return;
    }

    const next: PostItem = {
      id: `post-${Date.now()}`,
      title: cleanTitle,
      status: "Draft",
      score: Math.min(98, 72 + Math.floor(content.length / 35)),
      updatedAt: "Baru saja",
      content: content || "Draft baru belum memiliki isi lengkap.",
    };

    setPosts((items) => [next, ...items]);
    setTitle("");
    setContent("");
    alert("Draft tersimpan.");
  }

  function movePost(id: string, status: PostItem["status"]) {
    setPosts((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status, score: status === "Published" ? Math.max(item.score, 90) : item.score, updatedAt: "Baru saja" }
          : item
      )
    );
  }

  function deletePost(id: string) {
    setPosts((items) => items.filter((item) => item.id !== id));
  }

  function previewPost(post: PostItem) {
    window.localStorage.setItem(`studio28.preview.${post.id}`, JSON.stringify(post));
    window.open(`/preview/post/${post.id}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${closed ? styles.closed : ""}`}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <div className={styles.logo}>TA</div>
            <div className={styles.brandText}>
              <strong>Tri Apri Yogi</strong>
              <span>Studio 28</span>
            </div>
          </div>

          <button className={styles.toggle} onClick={() => setClosed((value) => !value)}>
            ▦
          </button>
        </div>

        <nav className={styles.menu}>
          {menu.map(([key, icon, label, href]) => (
            <Link key={key} href={href} className={`${styles.link} ${view === key ? styles.active : ""}`}>
              <span className={styles.icon}>{icon}</span>
              <span className={styles.label}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sideCard}>
          Studio 28 aktif.
          <br />
          Template, preview, draft, dan pipeline sudah digabung dalam satu ruang kerja.
        </div>
      </aside>

      <section className={styles.main}>
        <Header view={view} />

        <div className={styles.content}>
          <div className={styles.stats}>
            <Stat label="Template" value="1000" help="Siap dipilih dan dipreview." />
            <Stat label="Konten" value={String(stats.total)} help="Artikel, halaman, draft." />
            <Stat label="Terbit" value={String(stats.published)} help="Siap dibaca publik." />
            <Stat label="Skor" value={String(stats.score)} help="Kualitas rata-rata." />
          </div>

          {view === "dashboard" && <Dashboard posts={posts} movePost={movePost} previewPost={previewPost} />}
          {view === "templates" && <TemplateMarket templates={templates} query={query} setQuery={setQuery} />}
          {view === "editor" && <Editor title={title} content={content} setTitle={setTitle} setContent={setContent} saveDraft={saveDraft} />}
          {view === "posts" && <Posts posts={posts} movePost={movePost} deletePost={deletePost} previewPost={previewPost} />}
          {view === "analytics" && <Analytics posts={posts} />}
          {view === "settings" && <Settings />}
          {view === "admin" && <Admin />}
          {view === "profile" && <Profile />}
          {view === "page-editor" && <SiteBuilder />}
        </div>
      </section>
    </main>
  );
}

function Header({ view }: { view: View }) {
  const title: Record<View, string> = {
    dashboard: "Platform builder untuk konten, situs, dan bisnis.",
    templates: "Template market dengan 1000 pilihan siap pakai.",
    editor: "Article studio untuk menulis dan mengelola draft.",
    posts: "Content library untuk semua artikel dan halaman.",
    analytics: "Growth analytics untuk kualitas dan performa.",
    settings: "System settings untuk konfigurasi ruang kerja.",
    admin: "Admin control untuk akses dan audit.",
    profile: "Brand profile untuk identitas publik.",
    "page-editor": "Site builder untuk halaman bisnis dan toko.",
  };

  return (
    <header className={styles.header}>
      <div className={styles.commandBar}>
        <div className={styles.search}>
          <span>⌕</span>
          <input placeholder="Cari template, artikel, halaman, draft, atau pengaturan..." />
        </div>

        <div className={styles.actions}>
          <Link className={styles.secondary} href="/login">Keluar</Link>
          <Link className={styles.primary} href="/editor">Buat Draft</Link>
        </div>
      </div>

      <div className={styles.hero}>
        <div>
          <div className={styles.kicker}>Studio 28</div>
          <h1 className={styles.heroTitle}>{title[view]}</h1>
          <p className={styles.heroText}>
            Satu panel untuk membuat blog, website, situs bisnis, toko, halaman promosi, artikel, template, preview, dan publikasi.
          </p>
        </div>

        <div className={styles.heroPanel}>
          <h3>Workspace mission</h3>
          <div className={styles.health}>
            {["Template siap dipakai", "Preview tab baru aktif", "Pipeline konten aktif", "Draft tersimpan"].map((item) => (
              <div className={styles.healthRow} key={item}>
                <span>{item}</span>
                <span className={styles.dot} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{help}</small>
    </div>
  );
}

function Dashboard(props: {
  posts: PostItem[];
  movePost: (id: string, status: PostItem["status"]) => void;
  previewPost: (post: PostItem) => void;
}) {
  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Operating system konten</h2>
        <div className={styles.panelSub}>Alur kerja utama dari ide, draft, review, preview, sampai publikasi.</div>

        <div className={styles.workspaceGrid}>
          <Card title="Template Market" text="Pilih dari 1000 template custom untuk blog, bisnis, toko, dan halaman publik." />
          <Card title="Article Studio" text="Tulis artikel, simpan draft, review, lalu buka preview di tab baru." />
          <Card title="Site Builder" text="Susun halaman dari struktur hero, konten, katalog, harga, dan kontak." />
          <Card title="Growth Board" text="Cek skor, kualitas konten, dan prioritas perbaikan." />
        </div>

        <Pipeline posts={props.posts} movePost={props.movePost} previewPost={props.previewPost} />
      </section>

      <section className={styles.panel}>
        <h2>Quick launch</h2>
        <div className={styles.workspaceGrid}>
          <Link className={styles.dark} href="/templates">Pilih Template</Link>
          <Link className={styles.primary} href="/editor">Tulis Artikel</Link>
          <Link className={styles.secondary} href="/page-editor">Buat Halaman</Link>
          <Link className={styles.secondary} href="/posts">Kelola Konten</Link>
        </div>
      </section>
    </div>
  );
}

function TemplateMarket(props: {
  templates: TemplateItem[];
  query: string;
  setQuery: (value: string) => void;
}) {
  const filtered = props.templates
    .filter((item) => {
      const q = props.query.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.purpose.toLowerCase().includes(q);
    })
    .slice(0, 24);

  return (
    <section className={styles.panel}>
      <h2>Template market</h2>
      <div className={styles.panelSub}>1000 template tersedia. Cari kategori, tujuan, atau nama template.</div>

      <div className={styles.templateTools}>
        <input className={styles.input} value={props.query} onChange={(event) => props.setQuery(event.target.value)} placeholder="Cari template bisnis, toko, blog, portfolio..." />
      </div>

      <div className={styles.templateGrid}>
        {filtered.map((item) => (
          <TemplateCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function TemplateCard({ item }: { item: TemplateItem }) {
  return (
    <article className={styles.templateCard}>
      <span className={styles.badge}>{item.category}</span>
      <h3>{item.name}</h3>
      <p className={styles.small}>Untuk {item.purpose}. Skor template {item.score}/100.</p>
      <div className={styles.actions}>
        <a className={styles.primary} href={`/preview/template/${item.id}`} target="_blank" rel="noreferrer">Preview</a>
        <button className={styles.secondary} onClick={() => alert(`${item.name} dipilih sebagai draft situs.`)}>Gunakan</button>
      </div>
    </article>
  );
}

function Pipeline(props: {
  posts: PostItem[];
  movePost: (id: string, status: PostItem["status"]) => void;
  previewPost: (post: PostItem) => void;
}) {
  const lanes: PostItem["status"][] = ["Draft", "Review", "Published"];

  return (
    <div className={styles.pipeline}>
      {lanes.map((lane) => (
        <div className={styles.lane} key={lane}>
          <h3>{lane}</h3>

          {props.posts.filter((post) => post.status === lane).map((post) => (
            <div className={styles.task} key={post.id}>
              <strong>{post.title}</strong>
              <div className={styles.small}>Skor {post.score}/100 · {post.updatedAt}</div>

              <div className={styles.actions}>
                {lane !== "Review" && <button className={styles.secondary} onClick={() => props.movePost(post.id, "Review")}>Review</button>}
                {lane !== "Published" && <button className={styles.primary} onClick={() => props.movePost(post.id, "Published")}>Terbit</button>}
                <button className={styles.dark} onClick={() => props.previewPost(post)}>Preview</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Editor(props: {
  title: string;
  content: string;
  setTitle: (value: string) => void;
  setContent: (value: string) => void;
  saveDraft: () => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Composer</h2>
      <div className={styles.panelSub}>Tulis draft, lalu cek di content library untuk preview dan publikasi.</div>

      <div className={styles.form}>
        <input className={styles.input} value={props.title} onChange={(event) => props.setTitle(event.target.value)} placeholder="Judul artikel" />
        <textarea className={styles.textarea} value={props.content} onChange={(event) => props.setContent(event.target.value)} placeholder="Tulis isi artikel di sini..." />
        <button className={styles.primary} onClick={props.saveDraft}>Simpan Draft</button>
      </div>
    </section>
  );
}

function Posts(props: {
  posts: PostItem[];
  movePost: (id: string, status: PostItem["status"]) => void;
  deletePost: (id: string) => void;
  previewPost: (post: PostItem) => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Content library</h2>
      <div className={styles.panelSub}>Kelola status, preview di tab baru, terbitkan, atau hapus konten.</div>

      {props.posts.map((post) => (
        <div className={styles.row} key={post.id}>
          <div>
            <strong>{post.title}</strong>
            <div className={styles.small}>Update: {post.updatedAt}</div>
          </div>

          <span className={styles.badge}>{post.status}</span>
          <span>{post.score}/100</span>

          <div className={styles.actions}>
            <button className={styles.dark} onClick={() => props.previewPost(post)}>Preview</button>
            <button className={styles.secondary} onClick={() => props.movePost(post.id, "Review")}>Review</button>
            <button className={styles.primary} onClick={() => props.movePost(post.id, "Published")}>Terbit</button>
            <button className={styles.danger} onClick={() => props.deletePost(post.id)}>Hapus</button>
          </div>
        </div>
      ))}
    </section>
  );
}

function Analytics({ posts }: { posts: PostItem[] }) {
  const weak = posts.filter((post) => post.score < 85);

  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Growth analytics</h2>
        <div className={styles.panelSub}>{weak.length} konten perlu perbaikan agar lebih siap tampil.</div>

        <div className={styles.workspaceGrid}>
          <Card title="Kualitas judul" text="Judul harus jelas, punya kata kunci, dan mudah dipahami." />
          <Card title="Struktur konten" text="Konten perlu pembuka, isi utama, poin manfaat, dan ajakan bertindak." />
          <Card title="Kesiapan publikasi" text="Pastikan slug, ringkasan, kategori, dan preview sudah siap." />
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Konten prioritas</h2>
        {weak.map((post) => (
          <div className={styles.task} key={post.id}>
            <strong>{post.title}</strong>
            <div className={styles.small}>Skor {post.score}/100</div>
          </div>
        ))}
      </section>
    </div>
  );
}

function SiteBuilder() {
  return (
    <section className={styles.panel}>
      <h2>Site builder</h2>
      <div className={styles.panelSub}>Struktur halaman untuk blog, bisnis, toko, portfolio, dan halaman promosi.</div>

      <div className={styles.workspaceGrid}>
        <Card title="Hero section" text="Judul besar, deskripsi, tombol utama, dan visual." />
        <Card title="Content section" text="Artikel, kategori, produk, layanan, testimoni, atau galeri." />
        <Card title="Offer section" text="Paket harga, benefit, katalog, dan ajakan transaksi." />
        <Card title="Contact section" text="Form, lokasi, tautan komunikasi, dan data legal." />
      </div>
    </section>
  );
}

function Settings() {
  return (
    <section className={styles.panel}>
      <h2>System settings</h2>
      <div className={styles.form}>
        <input className={styles.input} defaultValue="Tri Apri Yogi Studio" />
        <input className={styles.input} defaultValue="triapriyogi.com" />
        <input className={styles.input} defaultValue="studio.triapriyogi.com" />
        <select className={styles.select} defaultValue="builder">
          <option value="builder">Builder workspace</option>
          <option value="editorial">Editorial workspace</option>
          <option value="commerce">Commerce workspace</option>
        </select>
        <button className={styles.primary} onClick={() => alert("Pengaturan tersimpan.")}>Simpan Pengaturan</button>
      </div>
    </section>
  );
}

function Admin() {
  return (
    <section className={styles.panel}>
      <h2>Admin control</h2>
      <div className={styles.workspaceGrid}>
        <Card title="Owner" text="Akses penuh untuk semua modul dan konfigurasi." />
        <Card title="Admin" text="Mengelola konten, user, template, dan pengaturan." />
        <Card title="Editor" text="Menulis, menyunting, preview, dan mengirim konten untuk review." />
        <Card title="Viewer" text="Melihat preview dan laporan tanpa mengubah data." />
      </div>
    </section>
  );
}

function Profile() {
  return (
    <section className={styles.panel}>
      <h2>Brand profile</h2>
      <div className={styles.form}>
        <input className={styles.input} defaultValue="Tri Apri Yogi" />
        <textarea className={styles.textarea} defaultValue="Ruang kerja digital untuk membangun blog, website, situs bisnis, toko, dan konten publik." />
        <button className={styles.primary} onClick={() => alert("Profil tersimpan.")}>Simpan Profil</button>
      </div>
    </section>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <article className={styles.card}>
      <h3>{title}</h3>
      <p className={styles.small}>{text}</p>
    </article>
  );
}
