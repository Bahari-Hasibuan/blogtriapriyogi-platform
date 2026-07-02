"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./StudioApp.module.css";

type View =
  | "dashboard"
  | "admin"
  | "editor"
  | "page-editor"
  | "posts"
  | "analytics"
  | "profile"
  | "settings";

type PostItem = {
  id: string;
  title: string;
  status: "Draft" | "Published" | "Review";
  score: number;
  updatedAt: string;
};

const menu = [
  ["dashboard", "▣", "Dashboard", "/dashboard"],
  ["editor", "✎", "Editor", "/editor"],
  ["posts", "☰", "Konten", "/posts"],
  ["page-editor", "▤", "Halaman", "/page-editor"],
  ["analytics", "◎", "Analitik", "/analytics"],
  ["admin", "⚙", "Admin", "/admin"],
  ["profile", "◉", "Profil", "/profile"],
  ["settings", "⌘", "Settings", "/settings"],
] as const;

const initialPosts: PostItem[] = [
  { id: "p1", title: "Panduan Membuat Blog Modern", status: "Published", score: 92, updatedAt: "Hari ini" },
  { id: "p2", title: "Strategi Menulis Artikel SEO", status: "Draft", score: 76, updatedAt: "Kemarin" },
  { id: "p3", title: "Cara Menata Halaman Profil", status: "Review", score: 88, updatedAt: "2 hari lalu" },
];

function loadPosts() {
  if (typeof window === "undefined") return initialPosts;

  const saved = window.localStorage.getItem("studio25.posts");
  if (!saved) return initialPosts;

  try {
    return JSON.parse(saved) as PostItem[];
  } catch {
    return initialPosts;
  }
}

export default function StudioApp({ view }: { view: View }) {
  const [closed, setClosed] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setPosts(loadPosts());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("studio25.posts", JSON.stringify(posts));
    }
  }, [posts]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((item) => item.status === "Published").length;
    const draft = posts.filter((item) => item.status === "Draft").length;
    const avg = Math.round(posts.reduce((sum, item) => sum + item.score, 0) / Math.max(total, 1));

    return { total, published, draft, avg };
  }, [posts]);

  function saveDraft() {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert("Judul artikel belum diisi.");
      return;
    }

    const next: PostItem = {
      id: `post-${Date.now()}`,
      title: cleanTitle,
      status: "Draft",
      score: Math.min(98, 70 + Math.floor(content.length / 30)),
      updatedAt: "Baru saja",
    };

    setPosts((items) => [next, ...items]);
    setTitle("");
    setContent("");
    alert("Draft tersimpan di browser.");
  }

  function publishPost(id: string) {
    setPosts((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "Published", score: Math.max(item.score, 88), updatedAt: "Baru saja" } : item
      )
    );
  }

  function deletePost(id: string) {
    setPosts((items) => items.filter((item) => item.id !== id));
  }

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${closed ? styles.sidebarClosed : ""}`}>
        <div className={styles.topMenu}>
          <div className={styles.brand}>
            <div className={styles.logo}>TA</div>
            <div className={styles.brandText}>
              <strong>Tri Apri Yogi</strong>
              <span>Studio v25</span>
            </div>
          </div>

          <button className={styles.iconButton} onClick={() => setClosed((value) => !value)} aria-label="Toggle menu">
            ▦
          </button>
        </div>

        <nav className={styles.menu}>
          {menu.map(([key, icon, label, href]) => (
            <Link key={key} href={href} className={`${styles.link} ${view === key ? styles.active : ""}`}>
              <span className={styles.menuIcon}>{icon}</span>
              <span className={styles.label}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.version}>
          Upgrade 25 aktif.
          <br />
          Menu kiri bisa dibuka-tutup.
          <br />
          Data konten tersimpan di browser.
        </div>
      </aside>

      <section className={styles.main}>
        <Header view={view} />

        <div className={styles.content}>
          <div className={styles.stats}>
            <Stat label="Total Konten" value={String(stats.total)} />
            <Stat label="Terbit" value={String(stats.published)} />
            <Stat label="Draft" value={String(stats.draft)} />
            <Stat label="Skor Rata-rata" value={String(stats.avg)} />
          </div>

          {view === "dashboard" ? <Dashboard posts={posts} publishPost={publishPost} /> : null}
          {view === "editor" ? (
            <Editor
              title={title}
              content={content}
              setTitle={setTitle}
              setContent={setContent}
              saveDraft={saveDraft}
            />
          ) : null}
          {view === "posts" ? <Posts posts={posts} publishPost={publishPost} deletePost={deletePost} /> : null}
          {view === "analytics" ? <Analytics posts={posts} /> : null}
          {view === "settings" ? <Settings /> : null}
          {view === "admin" ? <Admin /> : null}
          {view === "profile" ? <Profile /> : null}
          {view === "page-editor" ? <PageBuilder /> : null}
        </div>
      </section>
    </main>
  );
}

function Header({ view }: { view: View }) {
  const copy: Record<View, { title: string; desc: string }> = {
    dashboard: {
      title: "Ruang kendali konten.",
      desc: "Pantau konten, tulis draft, lihat performa, dan kelola alur publikasi dari satu tempat.",
    },
    editor: {
      title: "Editor artikel.",
      desc: "Tulis artikel, simpan draft, dan lanjutkan publikasi dari daftar konten.",
    },
    posts: {
      title: "Perpustakaan konten.",
      desc: "Kelola semua artikel, status, skor, dan tindakan publikasi.",
    },
    analytics: {
      title: "Analitik pertumbuhan.",
      desc: "Lihat ringkasan kualitas konten dan prioritas perbaikan.",
    },
    settings: {
      title: "Pengaturan sistem.",
      desc: "Atur identitas, domain kerja, mode publikasi, dan keamanan dasar.",
    },
    admin: {
      title: "Kontrol admin.",
      desc: "Kelola role, audit kerja, dan status ruang produksi.",
    },
    profile: {
      title: "Profil brand.",
      desc: "Atur identitas studio, bio publik, dan kanal kontak.",
    },
    "page-editor": {
      title: "Builder halaman.",
      desc: "Susun halaman publik dari blok konten yang rapi.",
    },
  };

  return (
    <header className={styles.header}>
      <div>
        <h1>{copy[view].title}</h1>
        <p>{copy[view].desc}</p>
      </div>

      <div className={styles.headerActions}>
        <Link className={styles.secondary} href="/login">
          Keluar
        </Link>
        <Link className={styles.primary} href="/editor">
          Buat Draft
        </Link>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Dashboard({ posts, publishPost }: { posts: PostItem[]; publishPost: (id: string) => void }) {
  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Konten terbaru</h2>
        <PostRows posts={posts.slice(0, 4)} publishPost={publishPost} />
      </section>

      <section className={styles.panel}>
        <h2>Prioritas kerja</h2>
        <div className={styles.cards}>
          <Card title="Rapikan draft" text="Pilih draft dengan skor rendah, perbaiki judul, struktur, dan ringkasan." />
          <Card title="Cek status" text="Konten review perlu diputuskan. Terbitkan atau kembalikan ke draft." />
          <Card title="Update halaman" text="Periksa halaman profil, harga, keamanan, dan status layanan." />
        </div>
      </section>
    </div>
  );
}

function Editor({
  title,
  content,
  setTitle,
  setContent,
  saveDraft,
}: {
  title: string;
  content: string;
  setTitle: (value: string) => void;
  setContent: (value: string) => void;
  saveDraft: () => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Composer</h2>
      <div className={styles.form}>
        <input className={styles.input} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul artikel" />
        <textarea className={styles.textarea} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Tulis isi artikel di sini" />
        <button className={styles.primary} onClick={saveDraft}>
          Simpan Draft
        </button>
      </div>
    </section>
  );
}

function Posts({
  posts,
  publishPost,
  deletePost,
}: {
  posts: PostItem[];
  publishPost: (id: string) => void;
  deletePost: (id: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Daftar konten</h2>
      <PostRows posts={posts} publishPost={publishPost} deletePost={deletePost} />
    </section>
  );
}

function PostRows({
  posts,
  publishPost,
  deletePost,
}: {
  posts: PostItem[];
  publishPost: (id: string) => void;
  deletePost?: (id: string) => void;
}) {
  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className={styles.row}>
          <div>
            <strong>{post.title}</strong>
            <div className={styles.small}>Update: {post.updatedAt}</div>
          </div>
          <span className={styles.badge}>{post.status}</span>
          <span>{post.score}/100</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {post.status !== "Published" ? (
              <button className={styles.secondary} onClick={() => publishPost(post.id)}>
                Terbit
              </button>
            ) : null}
            {deletePost ? (
              <button className={styles.danger} onClick={() => deletePost(post.id)}>
                Hapus
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Analytics({ posts }: { posts: PostItem[] }) {
  const weak = posts.filter((post) => post.score < 85);

  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Insight kualitas</h2>
        <div className={styles.notice}>
          {weak.length} konten perlu diperbaiki agar skor publikasi lebih kuat.
        </div>
        <div className={styles.cards}>
          <Card title="Judul" text="Gunakan judul jelas, singkat, dan sesuai topik utama." />
          <Card title="Struktur" text="Pisahkan pembuka, isi, langkah, dan kesimpulan." />
          <Card title="Ringkasan" text="Tambahkan deskripsi pendek untuk membantu mesin pencari." />
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Konten prioritas</h2>
        <PostRows posts={weak} publishPost={() => undefined} />
      </section>
    </div>
  );
}

function Settings() {
  return (
    <section className={styles.panel}>
      <h2>Konfigurasi ruang kerja</h2>
      <div className={styles.form}>
        <input className={styles.input} defaultValue="Tri Apri Yogi Studio" />
        <input className={styles.input} defaultValue="triapriyogi.com" />
        <input className={styles.input} defaultValue="studio.triapriyogi.com" />
        <select className={styles.select} defaultValue="modern">
          <option value="modern">Modern clean</option>
          <option value="dark">Dark control</option>
          <option value="simple">Simple workspace</option>
        </select>
        <button className={styles.primary} onClick={() => alert("Pengaturan tersimpan di tampilan sementara.")}>
          Simpan Pengaturan
        </button>
      </div>
    </section>
  );
}

function Admin() {
  return (
    <section className={styles.panel}>
      <h2>Role dan akses</h2>
      <div className={styles.cards}>
        <Card title="Owner" text="Akses penuh untuk semua modul." />
        <Card title="Admin" text="Mengelola konten, user, dan pengaturan." />
        <Card title="Editor" text="Menulis, menyunting, dan mengirim konten untuk review." />
      </div>
    </section>
  );
}

function Profile() {
  return (
    <section className={styles.panel}>
      <h2>Identitas studio</h2>
      <div className={styles.form}>
        <input className={styles.input} defaultValue="Tri Apri Yogi" />
        <textarea className={styles.textarea} defaultValue="Ruang kerja digital untuk mengelola konten, halaman, dan publikasi." />
        <button className={styles.primary} onClick={() => alert("Profil tersimpan di tampilan sementara.")}>
          Simpan Profil
        </button>
      </div>
    </section>
  );
}

function PageBuilder() {
  return (
    <section className={styles.panel}>
      <h2>Blok halaman</h2>
      <div className={styles.cards}>
        <Card title="Hero" text="Judul besar, deskripsi, dan tombol aksi." />
        <Card title="Fitur" text="Kartu keunggulan produk atau layanan." />
        <Card title="Harga" text="Paket, benefit, dan tombol langganan." />
        <Card title="Kontak" text="Form atau link menuju kanal komunikasi." />
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
