import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./StudioShell.module.css";

const menus = [
  ["dashboard", "Command Center", "/dashboard"],
  ["admin", "Admin Control", "/admin"],
  ["editor", "Article Studio", "/editor"],
  ["page-editor", "Page Builder", "/page-editor"],
  ["posts", "Content Library", "/posts"],
  ["analytics", "Growth Analytics", "/analytics"],
  ["profile", "Brand Profile", "/profile"],
  ["settings", "System Settings", "/settings"],
];

export function StudioShell({
  active,
  title,
  description,
  children,
}: {
  active: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>TA</div>
          <div>
            <strong>Tri Apri Yogi</strong>
            <span>Creator Studio v24</span>
          </div>
        </div>

        <nav className={styles.menu}>
          {menus.map(([key, label, href]) => (
            <Link
              key={key}
              href={href}
              className={`${styles.link} ${active === key ? styles.active : ""}`}
            >
              <span>{label}</span>
              <b>›</b>
            </Link>
          ))}
        </nav>

        <div className={styles.version}>
          CORE LOCK v2<br />
          Upgrade 24 Active<br />
          Studio route ready
        </div>
      </aside>

      <section className={styles.main}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>STUDIO DASHBOARD</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <Link href="/editor" className={styles.cta}>
            Buat Konten
          </Link>
        </div>

        {children}
      </section>
    </main>
  );
}

export function Stats() {
  return (
    <section className={styles.stats}>
      <div className={styles.stat}>
        <span>Total Konten</span>
        <strong>128</strong>
        <p>Artikel, halaman, draft, dan arsip.</p>
      </div>
      <div className={styles.stat}>
        <span>Halaman</span>
        <strong>42</strong>
        <p>Landing, profil, pricing, dan policy.</p>
      </div>
      <div className={styles.stat}>
        <span>Visitor</span>
        <strong>8.4K</strong>
        <p>Performa publik bulan ini.</p>
      </div>
      <div className={styles.stat}>
        <span>SEO Score</span>
        <strong>94</strong>
        <p>Kualitas optimasi konten.</p>
      </div>
    </section>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Cards({
  items,
}: {
  items: Array<{ title: string; text: string }>;
}) {
  return (
    <div className={styles.cards}>
      {items.map((item) => (
        <article key={item.title} className={styles.card}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ContentTable() {
  return (
    <div className={styles.table}>
      {[
        ["Cara Membuat Blog Premium", "Published", "SEO 94"],
        ["Panduan Domain Custom", "Draft", "SEO 81"],
        ["Strategi Konten Modern", "Review", "SEO 90"],
      ].map(([title, status, score]) => (
        <div key={title} className={styles.row}>
          <span>{title}</span>
          <b>{status}</b>
          <em>{score}</em>
        </div>
      ))}
    </div>
  );
}

export function StudioForm() {
  return (
    <div className={styles.form}>
      <input placeholder="Nama situs" />
      <input placeholder="Domain utama" />
      <input placeholder="Subdomain studio" />
      <select>
        <option>Studio Purple Cloud</option>
        <option>Studio Dark Pro</option>
        <option>Studio Clean White</option>
      </select>
      <button>Simpan Konfigurasi</button>
    </div>
  );
}

export function EditorForm() {
  return (
    <div className={styles.form}>
      <input placeholder="Judul artikel" />
      <input placeholder="Slug artikel" />
      <input placeholder="Meta description" />
      <textarea placeholder="Tulis konten artikel di sini" />
      <button>Simpan Draft</button>
    </div>
  );
}

export function LoginView() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.logo}>TA</div>
        <h1>Masuk ke Creator Studio v24.</h1>
        <p>Login untuk mengelola konten, halaman, SEO, analytics, dan pengaturan sistem.</p>
        <div className={styles.form}>
          <input placeholder="Email admin" />
          <input placeholder="Password" type="password" />
          <button>Masuk ke Studio</button>
        </div>
      </section>
    </main>
  );
}
