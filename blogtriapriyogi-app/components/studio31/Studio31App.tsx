"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./Studio31.module.css";
import { getTemplate, makeSlug, starterSite, SiteState, View } from "./studio31Data";
import { BuilderPanel, DashboardPanel } from "./Studio31PanelsA";
import { DomainsPanel, LibraryPanel, SettingsPanel } from "./Studio31PanelsB";

const menu = [
  ["dashboard", "▣", "Command", "/dashboard"],
  ["builder", "✎", "Builder", "/builder"],
  ["library", "☰", "Library", "/library"],
  ["domains", "◇", "Domain", "/domains"],
  ["settings", "⌘", "Settings", "/settings"],
] as const;

function loadSite() {
  if (typeof window === "undefined") return starterSite;

  const saved = window.localStorage.getItem("studio31.site");
  if (!saved) return starterSite;

  try {
    return JSON.parse(saved) as SiteState;
  } catch {
    return starterSite;
  }
}

export default function Studio31App({ view }: { view: View }) {
  const [closed, setClosed] = useState(true);
  const [site, setSite] = useState<SiteState>(starterSite);
  const [saveStatus, setSaveStatus] = useState("Siap.");

  useEffect(() => {
    setSite(loadSite());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studio31.site", JSON.stringify(site));
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
    "--bg": template.bg,
  } as CSSProperties;

  function syncPreviewCookie() {
    const minimal = {
      ...site,
      articleHtml: site.articleHtml.slice(0, 1200),
      pageHtml: site.pageHtml.slice(0, 1200),
      themeHtml: site.themeHtml.slice(0, 1200),
      themeCss: site.themeCss.slice(0, 1200),
    };

    const value = encodeURIComponent(JSON.stringify(minimal));
    document.cookie = `studio31_site=${value}; domain=.triapriyogi.com; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `studio31_site=${value}; path=/; max-age=2592000; SameSite=Lax`;
  }

  async function saveCloud() {
    setSaveStatus("Menyimpan...");

    const res = await fetch("/api/studio31/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: site.slug, site }),
    });

    const data = await res.json().catch(() => null);

    if (data?.ok) {
      setSaveStatus("Tersimpan ke cloud.");
    } else {
      setSaveStatus(data?.message || "Tersimpan lokal. Cloud belum aktif.");
    }

    syncPreviewCookie();
  }

  async function openPreview() {
    await saveCloud();
    window.open(`https://${site.slug}.triapriyogi.com`, "_blank", "noopener,noreferrer");
  }

  async function openPost(slug: string) {
    await saveCloud();
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

  function saveTheme() {
    syncPreviewCookie();
    alert("Tema tersimpan. Klik Preview Tema untuk melihat hasilnya.");
  }

  return (
    <main className={styles.shell} style={style}>
      <aside className={`${styles.sidebar} ${closed ? styles.closed : ""}`}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <div className={styles.logo}>TA</div>
            <div className={styles.brandText}>
              <strong>{site.siteName}</strong>
              <span>Studio 31</span>
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
          Builder untuk artikel, halaman, tema, SEO, domain gratis, custom domain, dan verifikasi DNS.
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <div className={styles.command}>
            <div className={styles.search}>
              <span>⌕</span>
              <input placeholder="Cari artikel, halaman, tema, SEO, domain, atau setting..." />
            </div>

            <div className={styles.actions}>
              <span className={styles.secondary}>{saveStatus}</span>
              <Link className={styles.secondary} href="/login">Keluar</Link>
              <button className={styles.primary} onClick={openPreview}>Preview Situs</button>
            </div>
          </div>

          <div className={styles.hero}>
            <div>
              <div className={styles.kicker}>Studio 31 Core</div>
              <h1>{copy[view].title}</h1>
              <p>{copy[view].desc}</p>
            </div>

            <div className={styles.live}>
              <h3>Live workspace</h3>
              <div className={styles.screen}>
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
          {view === "builder" && <BuilderPanel site={site} setSite={setSite} saveArticle={saveArticle} saveTheme={saveTheme} openPreview={openPreview} />}
          {view === "library" && <LibraryPanel site={site} setSite={setSite} openPost={openPost} />}
          {view === "domains" && <DomainsPanel site={site} setSite={setSite} saveCloud={saveCloud} openPreview={openPreview} />}
          {view === "settings" && <SettingsPanel site={site} setSite={setSite} saveCloud={saveCloud} />}
        </div>
      </section>
    </main>
  );
}

const copy: Record<View, { title: string; desc: string }> = {
  dashboard: {
    title: "Workspace builder untuk situs nyata.",
    desc: "Buat situs, artikel, halaman, tema HTML, SEO, domain gratis, custom domain, dan preview publik dalam satu sistem.",
  },
  builder: {
    title: "Builder artikel, halaman, tema, dan SEO.",
    desc: "Editor HTML artikel, page, tema, dan SEO digabung dalam satu ruang kerja.",
  },
  library: {
    title: "Library publikasi.",
    desc: "Kelola post, status, preview post, dan publikasi konten.",
  },
  domains: {
    title: "Domain dan verifikasi DNS.",
    desc: "Setiap workspace punya subdomain gratis dan custom domain dengan DNS verification.",
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
