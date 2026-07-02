"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./Studio27.module.css";

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
  status: "Draft" | "Review" | "Published";
  score: number;
  updatedAt: string;
};

const menu = [
  ["dashboard", "▣", "Command Center", "/dashboard"],
  ["editor", "✎", "Article Studio", "/editor"],
  ["posts", "☰", "Content Library", "/posts"],
  ["page-editor", "▤", "Page Builder", "/page-editor"],
  ["analytics", "◎", "Growth Analytics", "/analytics"],
  ["admin", "⚙", "Admin Control", "/admin"],
  ["profile", "◉", "Brand Profile", "/profile"],
  ["settings", "⌘", "System Settings", "/settings"],
] as const;

const starterPosts: PostItem[] = [
  { id: "p1", title: "Panduan Membuat Blog Modern", status: "Published", score: 94, updatedAt: "Hari ini" },
  { id: "p2", title: "Strategi Menulis Artikel", status: "Draft", score: 78, updatedAt: "Kemarin" },
  { id: "p3", title: "Cara Menata Halaman Profil", status: "Review", score: 87, updatedAt: "2 hari lalu" },
  { id: "p4", title: "Checklist Publikasi Konten", status: "Draft", score: 82, updatedAt: "3 hari lalu" },
];

function getStoredPosts() {
  if (typeof window === "undefined") return starterPosts;

  const saved = window.localStorage.getItem("studio27.posts");
  if (!saved) return starterPosts;

  try {
    return JSON.parse(saved) as PostItem[];
  } catch {
    return starterPosts;
  }
}

export default function Studio27App({ view }: { view: View }) {
  const [closed, setClosed] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>(starterPosts);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setPosts(getStoredPosts());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studio27.posts", JSON.stringify(posts));
  }, [posts]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((item) => item.status === "Published").length;
    const draft = posts.filter((item) => item.status === "Draft").length;
    const review = posts.filter((item) => item.status === "Review").length;
    const score = Math.round(posts.reduce((sum, item) => sum + item.score, 0) / Math.max(total, 1));

    return { total, published, draft, review, score };
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

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${closed ? styles.closed : ""}`}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <div className={styles.logo}>TA</div>
            <div className={styles.brandText}>
              <strong>Tri Apri Yogi</strong>
              <span>Studio 27</span>
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
          Sistem kerja konten sudah aktif.
          <br />
          Menu dapat dibuka dan ditutup.
          <br />
          Data tersimpan di browser.
        </div>
      </aside>

      <section className={styles.main}>
        <Header view={view} />

        <div className={styles.content}>
          <div className={styles.stats}>
            <Stat label="Total Konten" value={String(stats.total)} help="Artikel, halaman, draft." />
            <Stat label="Terbit" value={String(stats.published)} help="Siap dibaca publik." />
            <Stat label="Review" value={String(stats.review)} help="Perlu dicek ulang." />
            <Stat label="Skor Rata-rata" value={String(stats.score)} help="Kualitas konten." />
          </div>

          {view === "dashboard" && <Dashboard posts={posts} movePost={movePost} />}
          {view === "editor" && (
            <Editor
              title={title}
              content={content}
              setTitle={setTitle}
              setContent={setContent}
              saveDraft={saveDraft}
            />
          )}
          {view === "posts" && <Posts posts={posts} movePost={movePost} deletePost={deletePost} />}
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
      title: "Command center konten.",
      desc: "Kelola alur konten, publikasi, performa, halaman, dan pengaturan kerja dalam satu panel yang lebih rapi.",
    },
    editor: {
      title: "Article studio.",
      desc: "Tulis artikel, simpan draft, dan dorong konten ke tahap review.",
    },
    posts: {
      title: "Content library.",
      desc: "Pantau semua artikel, status, skor, dan tindakan publikasi.",
    },
    analytics: {
      title: "Growth analytics.",
      desc: "Baca kualitas konten, prioritas perbaikan, dan status performa.",
    },
    settings: {
      title: "System settings.",
      desc: "Atur identitas studio, domain kerja, mode publikasi, dan konfigurasi dasar.",
    },
    admin: {
      title: "Admin control.",
      desc: "Kelola role, akses, audit kerja, dan standar keamanan konten.",
    },
    profile: {
      title: "Brand profile.",
      desc: "Atur identitas, bio publik, dan informasi kontak.",
    },
    "page-editor": {
      title: "Page builder.",
      desc: "Susun halaman publik dari blok konten yang bersih dan mudah dibaca.",
    },
  };

  return (
    <header className={styles.header}>
      <div className={styles.commandBar}>
        <div className={styles.search}>
          <span>⌕</span>
          <input placeholder="Cari artikel, halaman, draft, atau pengaturan..." />
        </div>

        <div className={styles.headerActions}>
          <Link className={styles.secondary} href="/login">Keluar</Link>
          <Link className={styles.primary} href="/editor">Buat Draft</Link>
        </div>
      </div>

      <div className={styles.hero}>
        <div>
          <div className={styles.kicker}>Studio 27</div>
          <h1>{text[view].title}</h1>
          <p>{text[view].desc}</p>
        </div>

        <div className={styles.statusCard}>
          <h3>Workspace health</h3>
          <div className={styles.health}>
            {["Domain kerja aktif", "Editor siap digunakan", "Draft tersimpan", "Publikasi aman"].map((item) => (
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

function Dashboard({ posts, movePost }: { posts: PostItem[]; movePost: (id: string, status: PostItem["status"]) => void }) {
  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Pipeline konten</h2>
            <div className={styles.panelSub}>Pindahkan konten dari draft ke review, lalu terbitkan.</div>
          </div>
        </div>

        <Pipeline posts={posts} movePost={movePost} />
      </section>

      <section className={styles.panel}>
        <h2>Quick actions</h2>
        <div className={styles.cards}>
          <Card title="Buat draft baru" text="Mulai artikel baru dari editor." />
          <Card title="Audit konten" text="Cek konten dengan skor rendah." />
          <Card title="Rapikan halaman" text="Perbarui halaman penting dan profil." />
          <Card title="Cek publikasi" text="Pastikan konten siap tampil." />
        </div>
      </section>
    </div>
  );
}

function Pipeline({ posts, movePost }: { posts: PostItem[]; movePost: (id: string, status: PostItem["status"]) => void }) {
  const lanes: PostItem["status"][] = ["Draft", "Review", "Published"];

  return (
    <div className={styles.pipeline}>
      {lanes.map((lane) => (
        <div className={styles.lane} key={lane}>
          <h3>{lane}</h3>

          {posts.filter((post) => post.status === lane).map((post) => (
            <div className={styles.task} key={post.id}>
              <strong>{post.title}</strong>
              <div className={styles.small}>Skor {post.score}/100 · {post.updatedAt}</div>

              <div className={styles.actions} style={{ marginTop: 12 }}>
                {lane !== "Review" && (
                  <button className={styles.secondary} onClick={() => movePost(post.id, "Review")}>
                    Review
                  </button>
                )}

                {lane !== "Published" && (
                  <button className={styles.primary} onClick={() => movePost(post.id, "Published")}>
                    Terbitkan
                  </button>
                )}
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
}) {
  return (
    <section className={styles.panel}>
      <h2>Daftar konten</h2>
      {props.posts.map((post) => (
        <div className={styles.row} key={post.id}>
          <div>
            <div className={styles.rowTitle}>{post.title}</div>
            <div className={styles.small}>Update: {post.updatedAt}</div>
          </div>

          <span className={styles.badge}>{post.status}</span>
          <span>{post.score}/100</span>

          <div className={styles.actions}>
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
        <h2>Insight kualitas</h2>
        <div className={styles.notice}>{weak.length} konten perlu perbaikan agar lebih siap dipublikasikan.</div>
        <div className={styles.cards}>
          <Card title="Judul" text="Gunakan judul jelas, pendek, dan sesuai topik utama." />
          <Card title="Struktur" text="Pisahkan pembuka, isi, langkah, dan ringkasan." />
          <Card title="Keterbacaan" text="Gunakan paragraf pendek dan kalimat aktif." />
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Prioritas</h2>
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

function Settings() {
  return (
    <section className={styles.panel}>
      <h2>Konfigurasi ruang kerja</h2>
      <div className={styles.form}>
        <input className={styles.input} defaultValue="Tri Apri Yogi Studio" />
        <input className={styles.input} defaultValue="triapriyogi.com" />
        <input className={styles.input} defaultValue="studio.triapriyogi.com" />
        <select className={styles.select} defaultValue="premium">
          <option value="premium">Premium workspace</option>
          <option value="compact">Compact control</option>
          <option value="editorial">Editorial room</option>
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
