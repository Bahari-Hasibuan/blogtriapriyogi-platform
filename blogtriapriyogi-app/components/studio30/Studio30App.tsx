"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./Studio30.module.css";
import { getTemplate, makeSlug, starterSite, View, SiteState } from "./studio30Data";
import { BuilderPanel, DashboardPanel, DomainsPanel, LibraryPanel, SettingsPanel } from "./Studio30Panels";

const menu = [
  ["dashboard", "▣", "Command", "/dashboard"],
  ["builder", "✎", "Builder", "/builder"],
  ["library", "☰", "Library", "/library"],
  ["domains", "◇", "Domain", "/domains"],
  ["settings", "⌘", "Settings", "/settings"],
] as const;

function loadSite() {
  if (typeof window === "undefined") return starterSite;
  const saved = window.localStorage.getItem("studio30.site");
  if (!saved) return starterSite;

  try {
    return JSON.parse(saved) as SiteState;
  } catch {
    return starterSite;
  }
}

export default function Studio30App({ view }: { view: View }) {
  const [closed, setClosed] = useState(true);
  const [site, setSite] = useState<SiteState>(starterSite);

  useEffect(() => {
    setSite(loadSite());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studio30.site", JSON.stringify(site));
  }, [site]);

  const template = getTemplate(site.templateId);

  const stats = useMemo(() => {
    const total = site.posts.length;
    const published = site.posts.filter((post) => post.status === "Published").length;
    const draft = site.posts.filter((post) => post.status === "Draft").length;
    const score = Math.round(site.posts.reduce((sum, post) => sum + post.score, 0) / Math.max(total, 1));

    return { total, published, draft, score };
  }, [site.posts]);

  const style = {
    "--brand": template.c1,
    "--accent": template.c2,
  } as CSSProperties;

  function syncPreviewCookie() {
    const value = encodeURIComponent(JSON.stringify(site));

    document.cookie = `studio30_site=${value}; domain=.triapriyogi.com; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `studio30_site=${value}; path=/; max-age=2592000; SameSite=Lax`;
  }

  function openPreview() {
    syncPreviewCookie();
    window.open(`https://${site.slug}.triapriyogi.com`, "_blank", "noopener,noreferrer");
  }

  function openPost(slug: string) {
    syncPreviewCookie();
    window.open(`https://${site.slug}.triapriyogi.com/post/${slug}`, "_blank", "noopener,noreferrer");
  }

  function saveArticle() {
    const title = site.articleTitle.trim();

    if (!title) {
      alert("Judul artikel belum diisi.");
      return;
    }

    const slug = makeSlug(title);

    setSite((old) => ({
      ...old,
      posts: [
        {
          id: `post-${Date.now()}`,
          title,
          slug,
          status: "Draft",
          score: Math.min(98, 78 + Math.floor(old.articleHtml.length / 80)),
          bodyHtml: old.articleHtml,
          updatedAt: "Baru saja",
        },
        ...old.posts,
      ],
    }));

    alert("Artikel masuk ke library.");
  }

  return (
    <main className={styles.shell} style={style}>
      <aside className={`${styles.sidebar} ${closed ? styles.closed : ""}`}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <div className={styles.logo}>TA</div>
            <div className={styles.brandText}>
              <strong>{site.siteName}</strong>
              <span>Studio 30</span>
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
          Builder untuk artikel, halaman, tema, HTML, domain gratis, dan custom domain.
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <div className={styles.command}>
            <div className={styles.search}>
              <span>⌕</span>
              <input placeholder="Cari artikel, halaman, tema, domain, atau setting..." />
            </div>

            <div className={styles.actions}>
              <Link className={styles.secondary} href="/login">Keluar</Link>
              <button className={styles.primary} onClick={openPreview}>Preview Situs</button>
            </div>
          </div>

          <div className={styles.hero}>
            <div>
              <div className={styles.kicker}>Studio 30 Core</div>
              <h1>{copy[view].title}</h1>
              <p>{copy[view].desc}</p>
            </div>

            <div className={styles.previewCard}>
              <h3>Live workspace</h3>
              <div className={styles.previewScreen}>
                <h3>{site.siteName}</h3>
                <p>{site.slug}.triapriyogi.com</p>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.stats}>
            <Stat label="Konten" value={String(stats.total)} help="Artikel tersimpan." />
            <Stat label="Terbit" value={String(stats.published)} help="Konten publik." />
            <Stat label="Draft" value={String(stats.draft)} help="Belum terbit." />
            <Stat label="Skor" value={String(stats.score)} help="Rata-rata kualitas." />
          </div>

          {view === "dashboard" && <DashboardPanel site={site} openPreview={openPreview} />}
          {view === "builder" && <BuilderPanel site={site} setSite={setSite} saveArticle={saveArticle} openPreview={openPreview} />}
          {view === "library" && <LibraryPanel site={site} setSite={setSite} openPost={openPost} />}
          {view === "domains" && <DomainsPanel site={site} setSite={setSite} openPreview={openPreview} />}
          {view === "settings" && <SettingsPanel site={site} setSite={setSite} />}
        </div>
      </section>
    </main>
  );
}

const copy: Record<View, { title: string; desc: string }> = {
  dashboard: {
    title: "Workspace builder untuk situs nyata.",
    desc: "Buat situs, artikel, halaman, tema, HTML, subdomain gratis, custom domain, dan preview publik dari satu tempat.",
  },
  builder: {
    title: "Editor artikel, halaman, dan tema.",
    desc: "Edit HTML artikel, HTML halaman, dan HTML tema dalam satu builder tanpa memisahkan alur kerja.",
  },
  library: {
    title: "Library publikasi.",
    desc: "Kelola post, status, view postingan, dan buka hasilnya di tab browser baru.",
  },
  domains: {
    title: "Domain workspace.",
    desc: "Setiap user punya subdomain gratis, serta dapat memasang custom domain dari pengaturan.",
  },
  settings: {
    title: "Pengaturan situs.",
    desc: "Atur owner, tipe situs, identitas brand, dan konfigurasi workspace.",
  },
};

function Stat({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{help}</small>
    </div>
  );
}
