import Link from "next/link";
import type { ReactNode } from "react";
import "./studio.css";

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
    <main className="studio-page">
      <aside className="studio-sidebar">
        <div className="studio-brand">
          <div className="studio-logo">TA</div>
          <div>
            <strong>Tri Apri Yogi</strong>
            <span>Creator Studio v24</span>
          </div>
        </div>

        <nav className="studio-menu">
          {menus.map(([key, label, href]) => (
            <Link
              key={key}
              href={href}
              className={active === key ? "studio-link active" : "studio-link"}
            >
              <span>{label}</span>
              <b>›</b>
            </Link>
          ))}
        </nav>

        <div className="studio-version">
          CORE LOCK v2<br />
          Upgrade 24 Active
        </div>
      </aside>

      <section className="studio-main">
        <div className="studio-hero">
          <div>
            <p className="studio-eyebrow">STUDIO DASHBOARD</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <Link href="/editor" className="studio-cta">
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
    <section className="studio-stats">
      <div><span>Total Konten</span><strong>128</strong><p>Artikel, halaman, dan draft.</p></div>
      <div><span>Halaman</span><strong>42</strong><p>Landing, profil, dan policy.</p></div>
      <div><span>Visitor</span><strong>8.4K</strong><p>Performa bulan ini.</p></div>
      <div><span>SEO Score</span><strong>94</strong><p>Kualitas optimasi konten.</p></div>
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
    <section className="studio-panel">
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
    <div className="studio-cards">
      {items.map((item) => (
        <article key={item.title} className="studio-card">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ContentTable() {
  return (
    <div className="studio-table">
      {[
        ["Cara Membuat Blog Premium", "Published", "SEO 94"],
        ["Panduan Domain Custom", "Draft", "SEO 81"],
        ["Strategi Konten Modern", "Review", "SEO 90"],
      ].map(([title, status, score]) => (
        <div key={title} className="studio-row">
          <span>{title}</span>
          <b>{status}</b>
          <em>{score}</em>
        </div>
      ))}
    </div>
  );
}
