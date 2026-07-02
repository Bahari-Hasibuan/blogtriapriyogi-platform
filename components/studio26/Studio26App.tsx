"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./Studio26.module.css";

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

const starterPosts: PostItem[] = [
  { id: "p1", title: "Panduan Membuat Blog Modern", status: "Published", score: 92, updatedAt: "Hari ini" },
  { id: "p2", title: "Strategi Menulis Artikel", status: "Draft", score: 76, updatedAt: "Kemarin" },
  { id: "p3", title: "Cara Menata Halaman Profil", status: "Review", score: 88, updatedAt: "2 hari lalu" },
];

function getStoredPosts() {
  if (typeof window === "undefined") return starterPosts;

  const saved = window.localStorage.getItem("studio26.posts");
  if (!saved) return starterPosts;

  try {
    return JSON.parse(saved) as PostItem[];
  } catch {
    return starterPosts;
  }
}

export default function Studio26App({ view }: { view: View }) {
  const [closed, setClosed] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>(starterPosts);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setPosts(getStoredPosts());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studio26.posts", JSON.stringify(posts));
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
      score: Math.min(98, 70 + Math.floor(content.length / 35)),
      updatedAt: "Baru saja",
    };

    setPosts((items) => [next, ...items]);
    setTitle("");
    setContent("");
    alert("Draft tersimpan.");
  }

  function publishPost(id: string) {
    setPosts((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: "Published", score: Math.max(item.score, 88), updatedAt: "Baru saja" }
          : item
      )
    );
  }

  function deletePost(id: string) {
    setPosts((items) => items.filter((item) => item.id !== id));
  }

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${closed ? styles.closed : ""}`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>TA</div>
            <div className={styles.brandText}>
              <strong>Tri Apri Yogi</strong>
              <span>Studio v26</span>
            </div>
          </div>

          <button className={styles.toggle} onClick={() => setClosed((value) => !value)} aria-label="Buka tutup menu">
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

        <div className={styles.note}>
          Upgrade 26 aktif.
          <br />
          Klik tombol kotak untuk buka menu.
          <br />
          Draft tersimpan di browser.
        </div>
      </aside>

      <section className={styles.main}>
        <Header view={view} />

        <div className={styles.content}>
          <div className={styles.stats}>
            <Stat label="Total Konten" value={String(stats.total)} />
            <Stat label="Terbit" value={String(stats.published)} />
            <Stat label="Draft" value={String(stats.draft)} />
            <Stat label="Skor" value={String(stats.score)} />
          </div>

          {view === "dashboard" && <Dashboard posts={posts} publishPost={publishPost} />}
          {view === "editor" && (
            <Editor
              title={title}
              content={content}
              setTitle={setTitle}
              setContent={setContent}
              saveDraft={saveDraft}
            />
          )}
          {view === "posts" && <Posts posts={posts} publishPost={publishPost} deletePost={deletePost} />}
          {view === "analytics" && <Analytics posts={posts} />}
          {view === "settings" && <Settings />}
          {view === "admin" && <Admin />}
          {view === "profile" && <Profile />}
          {view === "page-editor" && <PageBuilder />}
        </div>
      </section>
    </main>
  );
}

function Header({ view }: { view: View }) {
  const text: Record<View, { title: string; desc: string }> = {
    dashboard: {
      title: "Ruang kendali konten.",
      desc: "Pantau konten, tulis draft, kelola halaman, dan lihat status publikasi dengan tampilan yang lebih lega.",
    },
    editor: {
      title: "Editor artikel.",
      desc: "Tulis artikel, simpan draft, lalu lanjutkan publikasi dari menu konten.",
    },
    posts: {
      title: "Manajemen konten.",
      desc: "Kelola semua artikel, status, skor, dan tindakan publikasi.",
    },
    analytics: {
      title: "Analitik konten.",
      desc: "Lihat ringkasan kualitas, prioritas perbaikan, dan status konten.",
    },
    settings: {
      title: "Pengaturan sistem.",
      desc: "Atur identitas, domain kerja, mode publikasi, dan konfigurasi dasar.",
    },
    admin: {
      title: "Kontrol admin.",
      desc: "Kelola akses, role kerja, dan keamanan dasar studio.",
    },
    profile: {
      title: "Profil brand.",
      desc: "Atur identitas, bio publik, dan informasi kontak.",
    },
    "page-editor": {
      title: "Builder halaman.",
      desc: "Susun halaman publik dari blok yang rapi dan mudah dibaca.",
    },
  };

  return (
    <header className={styles.header}>
      <div>
        <h1>{text[view].title}</h1>
        <p>{text[view].desc}</p>
      </div>

      <div className={styles.actions}>
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
          <Card title="Rapikan draft" text="Pilih draft dengan skor rendah, lalu perbaiki judul, isi, dan ringkasan." />
          <Card title="Terbitkan konten" text="Konten yang sudah siap bisa langsung dipindahkan ke status terbit." />
          <Card title="Cek halaman" text="Periksa halaman profil, harga, keamanan, dan status layanan." />
        </div>
      </section>
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

      <div className={styles.form}>
        <input
          className={styles.input}
          value={props.title}
          onChange={(event) => props.setTitle(event.target.value)}
          placeholder="Judul artikel"
        />
        <textarea
          className={styles.textarea}
          value={props.content}
          onChange={(event) => props.setContent(event.target.value)}
          placeholder="Tulis isi artikel di sini"
        />
        <button className={styles.primary} onClick={props.saveDraft}>
          Simpan Draft
        </button>
      </div>
    </section>
  );
}

function Posts(props: {
  posts: PostItem[];
  publishPost: (id: string) => void;
  deletePost: (id: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Daftar konten</h2>
      <PostRows posts={props.posts} publishPost={props.publishPost} deletePost={props.deletePost} />
    </section>
  );
}

function PostRows(props: {
  posts: PostItem[];
  publishPost: (id: string) => void;
  deletePost?: (id: string) => void;
}) {
  return (
    <div>
      {props.posts.map((post) => (
        <div key={post.id} className={styles.row}>
          <div>
            <div className={styles.rowTitle}>{post.title}</div>
            <div className={styles.small}>Update: {post.updatedAt}</div>
          </div>

          <span className={styles.badge}>{post.status}</span>
          <span>{post.score}/100</span>

          <div className={styles.actions}>
            {post.status !== "Published" && (
              <button className={styles.secondary} onClick={() => props.publishPost(post.id)}>
                Terbitkan
              </button>
            )}

            {props.deletePost && (
              <button className={styles.danger} onClick={() => props.deletePost?.(post.id)}>
                Hapus
              </button>
            )}
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
        <div className={styles.notice}>{weak.length} konten perlu diperbaiki sebelum diprioritaskan.</div>
        <div className={styles.cards}>
          <Card title="Judul" text="Gunakan judul jelas, pendek, dan sesuai topik utama." />
          <Card title="Struktur" text="Pisahkan pembuka, isi, langkah, dan penutup." />
          <Card title="Ringkasan" text="Tambahkan deskripsi pendek yang membantu pembaca." />
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
        <button className={styles.primary} onClick={() => alert("Pengaturan tersimpan.")}>
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
        <button className={styles.primary} onClick={() => alert("Profil tersimpan.")}>
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
