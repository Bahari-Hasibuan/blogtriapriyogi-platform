"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import styles from "./Studio31.module.css";
import { BuilderTab, SiteState, getTemplate, makeSlug, templates } from "./studio31Data";

type SetSite = Dispatch<SetStateAction<SiteState>>;

export function DashboardPanel({
  site,
  openPreview,
}: {
  site: SiteState;
  openPreview: () => void;
}) {
  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Workspace platform</h2>
        <p className={styles.sub}>
          Sistem untuk membuat situs, blog, toko, brand, komunitas, artikel, halaman, tema, SEO, dan domain dalam satu workspace.
        </p>

        <div className={styles.cards}>
          <Card title="1000 template engine" text="Template dibuat dari kategori, layout, dan palet warna." />
          <Card title="HTML editor" text="Artikel, halaman, dan tema punya editor HTML sendiri." />
          <Card title="SEO workspace" text="Title, description, keyword, canonical, dan OG bisa diatur." />
          <Card title="Domain system" text={`Domain gratis aktif: ${site.slug}.triapriyogi.com`} />
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Live site</h2>
        <div className={styles.domainBox}>
          <div className={styles.domainName}>{site.slug}.triapriyogi.com</div>
          <p className={styles.small}>Klik untuk melihat situs di tab baru.</p>
          <button className={styles.primary} onClick={openPreview}>Buka Preview Situs</button>
        </div>
      </section>
    </div>
  );
}

export function BuilderPanel({
  site,
  setSite,
  saveArticle,
  saveTheme,
  openPreview,
}: {
  site: SiteState;
  setSite: SetSite;
  saveArticle: () => void;
  saveTheme: () => void;
  openPreview: () => void;
}) {
  const [tab, setTab] = useState<BuilderTab>("article");
  const [query, setQuery] = useState("");

  const visibleTemplates = useMemo(() => {
    const q = query.toLowerCase().trim();

    return templates
      .filter((item) => {
        if (!q) return true;
        return `${item.name} ${item.category} ${item.layout} ${item.use}`.toLowerCase().includes(q);
      })
      .slice(0, 36);
  }, [query]);

  function applyTemplate(templateId: string) {
    const template = getTemplate(templateId);

    setSite((old) => ({
      ...old,
      templateId,
      themeHtml: template.html,
      themeCss: template.css,
    }));
  }

  return (
    <section className={styles.panel}>
      <h2>Builder artikel, halaman, tema, dan SEO</h2>
      <p className={styles.sub}>
        Semua editor digabung di satu builder. Tema bukan menu terpisah di sidebar.
      </p>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "article" ? styles.tabActive : ""}`} onClick={() => setTab("article")}>Artikel atau Post</button>
        <button className={`${styles.tab} ${tab === "page" ? styles.tabActive : ""}`} onClick={() => setTab("page")}>Halaman atau Page</button>
        <button className={`${styles.tab} ${tab === "theme" ? styles.tabActive : ""}`} onClick={() => setTab("theme")}>Tema dan HTML</button>
        <button className={`${styles.tab} ${tab === "seo" ? styles.tabActive : ""}`} onClick={() => setTab("seo")}>SEO</button>
      </div>

      {tab === "article" && (
        <div className={styles.form}>
          <input
            className={styles.input}
            value={site.articleTitle}
            onChange={(event) => setSite((old) => ({ ...old, articleTitle: event.target.value }))}
            placeholder="Judul artikel"
          />

          <textarea
            className={styles.textarea}
            value={site.articleHtml}
            onChange={(event) => setSite((old) => ({ ...old, articleHtml: event.target.value }))}
            placeholder="<h1>Judul artikel</h1>"
          />

          <div className={styles.actions}>
            <button className={styles.primary} onClick={saveArticle}>Simpan Artikel ke Library</button>
            <button className={styles.secondary} onClick={openPreview}>Preview Situs</button>
          </div>
        </div>
      )}

      {tab === "page" && (
        <div className={styles.form}>
          <textarea
            className={styles.textarea}
            value={site.pageHtml}
            onChange={(event) => setSite((old) => ({ ...old, pageHtml: event.target.value }))}
            placeholder="<section>HTML halaman</section>"
          />

          <button className={styles.primary} onClick={openPreview}>Preview Halaman</button>
        </div>
      )}

      {tab === "theme" && (
        <div className={styles.form}>
          <input
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari template berdasarkan kategori, layout, warna, atau fungsi"
          />

          <div className={styles.notice}>
            Total template engine: {templates.length}. Yang tampil dibatasi 36 agar dashboard tetap ringan.
          </div>

          <div className={styles.templates}>
            {visibleTemplates.map((template) => (
              <button
                key={template.id}
                className={styles.template}
                style={{ "--c1": template.c1, "--c2": template.c2 } as React.CSSProperties}
                onClick={() => applyTemplate(template.id)}
              >
                <div className={styles.templateVisual} />
                <h3>{template.name}</h3>
                <p className={styles.small}>{template.use}</p>
              </button>
            ))}
          </div>

          <textarea
            className={styles.textarea}
            value={site.themeHtml}
            onChange={(event) => setSite((old) => ({ ...old, themeHtml: event.target.value }))}
            placeholder="<section>HTML tema custom</section>"
          />

          <textarea
            className={styles.textarea}
            value={site.themeCss}
            onChange={(event) => setSite((old) => ({ ...old, themeCss: event.target.value }))}
            placeholder=".class { color: red; }"
          />

          <div className={styles.actions}>
            <button className={styles.primary} onClick={saveTheme}>Simpan Tema</button>
            <button className={styles.secondary} onClick={openPreview}>Preview Tema</button>
          </div>
        </div>
      )}

      {tab === "seo" && <SeoEditor site={site} setSite={setSite} />}
    </section>
  );
}

function SeoEditor({ site, setSite }: { site: SiteState; setSite: SetSite }) {
  return (
    <div className={styles.form}>
      <input
        className={styles.input}
        value={site.seo.title}
        onChange={(event) => setSite((old) => ({ ...old, seo: { ...old.seo, title: event.target.value } }))}
        placeholder="SEO title"
      />

      <textarea
        className={styles.textarea}
        value={site.seo.description}
        onChange={(event) => setSite((old) => ({ ...old, seo: { ...old.seo, description: event.target.value } }))}
        placeholder="Meta description"
      />

      <input
        className={styles.input}
        value={site.seo.keywords}
        onChange={(event) => setSite((old) => ({ ...old, seo: { ...old.seo, keywords: event.target.value } }))}
        placeholder="Keywords"
      />

      <input
        className={styles.input}
        value={site.seo.canonical}
        onChange={(event) => setSite((old) => ({ ...old, seo: { ...old.seo, canonical: event.target.value } }))}
        placeholder="Canonical URL"
      />

      <input
        className={styles.input}
        value={site.seo.ogTitle}
        onChange={(event) => setSite((old) => ({ ...old, seo: { ...old.seo, ogTitle: event.target.value } }))}
        placeholder="Open Graph title"
      />

      <textarea
        className={styles.textarea}
        value={site.seo.ogDescription}
        onChange={(event) => setSite((old) => ({ ...old, seo: { ...old.seo, ogDescription: event.target.value } }))}
        placeholder="Open Graph description"
      />

      <button
        className={styles.primary}
        onClick={() => alert("SEO tersimpan.")}
      >
        Simpan SEO
      </button>
    </div>
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
