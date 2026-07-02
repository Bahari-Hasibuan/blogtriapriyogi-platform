"use client";

import { Dispatch, SetStateAction, useState } from "react";
import styles from "./Studio30.module.css";
import { BuilderTab, SiteState, makeSlug, templates } from "./studio30Data";

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
        <h2>Platform workspace</h2>
        <p className={styles.sub}>
          Satu ruang untuk membuat situs, mengatur domain, menulis artikel, membuat halaman, dan mengubah tema.
        </p>

        <div className={styles.cards}>
          <Card title="Builder utama" text="Edit artikel, halaman, dan HTML tema dari satu tempat." />
          <Card title="Domain gratis" text={`Alamat aktif: ${site.slug}.triapriyogi.com`} />
          <Card title="Custom domain" text="Hubungkan domain pribadi dari pengaturan domain." />
          <Card title="Preview tab baru" text="Buka hasil situs langsung dari tombol preview." />
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Quick launch</h2>
        <div className={styles.domainBox}>
          <div className={styles.domainName}>{site.slug}.triapriyogi.com</div>
          <p className={styles.small}>Domain gratis untuk workspace ini.</p>
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
  openPreview,
}: {
  site: SiteState;
  setSite: SetSite;
  saveArticle: () => void;
  openPreview: () => void;
}) {
  const [tab, setTab] = useState<BuilderTab>("article");

  return (
    <section className={styles.panel}>
      <h2>Builder konten dan tema</h2>
      <p className={styles.sub}>
        Editor HTML artikel, halaman, dan tema digabung di sini agar alur kerja tidak pecah.
      </p>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "article" ? styles.tabActive : ""}`} onClick={() => setTab("article")}>Artikel atau Post</button>
        <button className={`${styles.tab} ${tab === "page" ? styles.tabActive : ""}`} onClick={() => setTab("page")}>Halaman atau Page</button>
        <button className={`${styles.tab} ${tab === "theme" ? styles.tabActive : ""}`} onClick={() => setTab("theme")}>Tema dan HTML</button>
      </div>

      {tab === "article" ? (
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
            <button className={styles.primary} onClick={saveArticle}>Simpan ke Library</button>
            <button className={styles.secondary} onClick={openPreview}>Preview di Tab Baru</button>
          </div>
        </div>
      ) : null}

      {tab === "page" ? (
        <div className={styles.form}>
          <textarea
            className={styles.textarea}
            value={site.pageHtml}
            onChange={(event) => setSite((old) => ({ ...old, pageHtml: event.target.value }))}
            placeholder="<section>HTML halaman</section>"
          />
          <button className={styles.primary} onClick={openPreview}>Preview Halaman</button>
        </div>
      ) : null}

      {tab === "theme" ? (
        <div className={styles.form}>
          <div className={styles.templates}>
            {templates.map((template) => (
              <button
                key={template.id}
                className={styles.template}
                style={{ "--c1": template.c1, "--c2": template.c2 } as React.CSSProperties}
                onClick={() => setSite((old) => ({ ...old, templateId: template.id }))}
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
            placeholder="<section>HTML tambahan tema</section>"
          />
          <button className={styles.primary} onClick={openPreview}>Preview Tema</button>
        </div>
      ) : null}
    </section>
  );
}

export function LibraryPanel({
  site,
  setSite,
  openPost,
}: {
  site: SiteState;
  setSite: SetSite;
  openPost: (slug: string) => void;
}) {
  function move(id: string, status: "Draft" | "Review" | "Published") {
    setSite((old) => ({
      ...old,
      posts: old.posts.map((post) =>
        post.id === id
          ? { ...post, status, updatedAt: "Baru saja", score: status === "Published" ? Math.max(post.score, 90) : post.score }
          : post
      ),
    }));
  }

  function remove(id: string) {
    setSite((old) => ({ ...old, posts: old.posts.filter((post) => post.id !== id) }));
  }

  return (
    <section className={styles.panel}>
      <h2>Library konten</h2>
      <p className={styles.sub}>Kelola artikel, status publikasi, dan preview post.</p>

      {site.posts.map((post) => (
        <div className={styles.row} key={post.id}>
          <div>
            <div className={styles.rowTitle}>{post.title}</div>
            <div className={styles.small}>/{post.slug} · {post.updatedAt}</div>
          </div>
          <span className={styles.badge}>{post.status}</span>
          <span>{post.score}/100</span>
          <div className={styles.actions}>
            <button className={styles.secondary} onClick={() => move(post.id, "Review")}>Review</button>
            <button className={styles.primary} onClick={() => move(post.id, "Published")}>Terbit</button>
            <button className={styles.dark} onClick={() => openPost(post.slug)}>View</button>
            <button className={styles.danger} onClick={() => remove(post.id)}>Hapus</button>
          </div>
        </div>
      ))}
    </section>
  );
}

export function DomainsPanel({
  site,
  setSite,
  openPreview,
}: {
  site: SiteState;
  setSite: SetSite;
  openPreview: () => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Domain workspace</h2>
      <p className={styles.sub}>Setiap workspace punya subdomain gratis dan bisa memasang domain pribadi.</p>

      <div className={styles.form}>
        <label>
          <p className={styles.small}>Nama situs, brand, toko, bisnis, atau komunitas</p>
          <input
            className={styles.input}
            value={site.siteName}
            onChange={(event) =>
              setSite((old) => ({
                ...old,
                siteName: event.target.value,
                slug: makeSlug(event.target.value),
              }))
            }
          />
        </label>

        <label>
          <p className={styles.small}>Subdomain gratis</p>
          <input
            className={styles.input}
            value={site.slug}
            onChange={(event) => setSite((old) => ({ ...old, slug: makeSlug(event.target.value) }))}
          />
        </label>

        <div className={styles.domainBox}>
          <div className={styles.domainName}>{site.slug}.triapriyogi.com</div>
          <p className={styles.small}>Alamat ini dibuka di tab baru untuk melihat hasil situs.</p>
          <button className={styles.primary} onClick={openPreview}>Buka Domain Gratis</button>
        </div>

        <label>
          <p className={styles.small}>Custom domain</p>
          <input
            className={styles.input}
            value={site.customDomain}
            onChange={(event) => setSite((old) => ({ ...old, customDomain: event.target.value }))}
            placeholder="contoh: namabisnis.com"
          />
        </label>
      </div>
    </section>
  );
}

export function SettingsPanel({
  site,
  setSite,
}: {
  site: SiteState;
  setSite: SetSite;
}) {
  return (
    <section className={styles.panel}>
      <h2>Pengaturan workspace</h2>
      <div className={styles.form}>
        <input
          className={styles.input}
          value={site.owner}
          onChange={(event) => setSite((old) => ({ ...old, owner: event.target.value }))}
          placeholder="Nama owner"
        />
        <input
          className={styles.input}
          value={site.siteType}
          onChange={(event) => setSite((old) => ({ ...old, siteType: event.target.value }))}
          placeholder="Jenis situs"
        />
        <button className={styles.primary} onClick={() => alert("Pengaturan tersimpan.")}>Simpan Pengaturan</button>
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
