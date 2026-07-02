import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./StudioShell.module.css";

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "admin", label: "Admin", href: "/admin" },
  { key: "profile", label: "Profil", href: "/profile" },
  { key: "editor", label: "Editor Artikel", href: "/editor" },
  { key: "page-editor", label: "Editor Halaman", href: "/page-editor" },
  { key: "posts", label: "Post Manager", href: "/posts" },
  { key: "analytics", label: "Analytics", href: "/analytics" },
  { key: "settings", label: "Settings", href: "/settings" },
];

export function StudioShell({
  active,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  children,
}: {
  active: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.avatar}>TA</div>
          <div>
            <div className={styles.brandName}>Tri Apri Yogi</div>
            <div className={styles.brandSub}>Studio CMS</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navItem} ${active === item.key ? styles.active : ""}`}
            >
              <span>{item.label}</span>
              <span>›</span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className={styles.content}>
        <div className={styles.topbar}>
          <div>
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.desc}>{description}</p>
          </div>

          {ctaLabel && ctaHref ? (
            <Link href={ctaHref} className={styles.cta}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        {children}
      </section>
    </main>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function StatCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue}>{value}</div>
      <div className={styles.cardHelp}>{help}</div>
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

export function ContentTable({
  rows,
}: {
  rows: Array<{ title: string; status: string; metric: string }>;
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Judul</th>
          <th className={styles.th}>Status</th>
          <th className={styles.th}>Skor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.title}>
            <td className={styles.td}>{row.title}</td>
            <td className={styles.td}>
              <span className={styles.badge}>{row.status}</span>
            </td>
            <td className={styles.td}>{row.metric}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ActionGrid({
  items,
}: {
  items: Array<{ title: string; text: string }>;
}) {
  return (
    <div className={styles.actionGrid}>
      {items.map((item) => (
        <div key={item.title} className={styles.action}>
          <div className={styles.actionTitle}>{item.title}</div>
          <div className={styles.actionText}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}

export function EditorBox() {
  return (
    <div className={styles.editorBox}>
      <input className={styles.input} placeholder="Judul artikel" />
      <input className={styles.input} placeholder="Slug artikel" />
      <input className={styles.input} placeholder="Meta description" />
      <textarea className={styles.textarea} placeholder="Tulis konten artikel di sini" />
      <button className={styles.primaryButton}>Simpan Draft</button>
    </div>
  );
}
