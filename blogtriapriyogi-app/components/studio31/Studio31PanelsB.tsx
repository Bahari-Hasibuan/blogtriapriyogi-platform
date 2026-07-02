"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import styles from "./Studio31.module.css";
import { SiteState, makeSlug } from "./studio31Data";

type SetSite = Dispatch<SetStateAction<SiteState>>;

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
      <p className={styles.sub}>Kelola post, status, dan view postingan di tab baru.</p>

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
  saveCloud,
  openPreview,
}: {
  site: SiteState;
  setSite: SetSite;
  saveCloud: () => Promise<void>;
  openPreview: () => void;
}) {
  const [checking, setChecking] = useState(false);

  async function verifyDomain() {
    if (!site.domain.customDomain.trim()) {
      alert("Isi custom domain dulu.");
      return;
    }

    setChecking(true);

    const res = await fetch("/api/domain/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: site.domain.customDomain }),
    });

    const data = await res.json();

    setSite((old) => ({
      ...old,
      domain: {
        ...old.domain,
        verified: Boolean(data.ok),
        lastChecked: new Date().toLocaleString(),
        message: data.message || "Selesai cek DNS.",
      },
    }));

    setChecking(false);
  }

  async function saveDomain() {
    setSite((old) => ({
      ...old,
      domain: {
        ...old.domain,
        saved: true,
        message: "Domain disimpan. Lanjut verifikasi DNS.",
      },
    }));

    await saveCloud();
    alert("Domain tersimpan.");
  }

  return (
    <section className={styles.panel}>
      <h2>Domain workspace</h2>
      <p className={styles.sub}>
        Setiap user punya subdomain gratis dan bisa memasang custom domain dengan verifikasi DNS.
      </p>

      <div className={styles.form}>
        <label>
          <p className={styles.small}>Nama blog, website, brand, toko, bisnis, atau komunitas</p>
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
          <p className={styles.small}>Alamat gratis workspace ini.</p>
          <button className={styles.primary} onClick={openPreview}>Buka Domain Gratis</button>
        </div>

        <label>
          <p className={styles.small}>Custom domain</p>
          <input
            className={styles.input}
            value={site.domain.customDomain}
            onChange={(event) =>
              setSite((old) => ({
                ...old,
                domain: {
                  ...old.domain,
                  customDomain: event.target.value,
                  saved: false,
                  verified: false,
                  message: "Domain berubah. Simpan dan verifikasi ulang.",
                },
              }))
            }
            placeholder="contoh: namabisnis.com"
          />
        </label>

        <div className={styles.dnsBox}>
          <h3>DNS record wajib</h3>

          <div className={styles.code}>
            CNAME<br />
            Host: www atau root sesuai DNS provider<br />
            Value: connect.triapriyogi.com
          </div>

          <div className={styles.code}>
            TXT<br />
            Host: _triapriyogi<br />
            Value: jskslalbdkekeb
          </div>

          <p className={styles.small}>
            Status: {site.domain.message}
            <br />
            Terakhir dicek: {site.domain.lastChecked || "-"}
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primary} onClick={saveDomain}>Simpan Domain</button>
          <button className={styles.secondary} onClick={verifyDomain} disabled={checking}>
            {checking ? "Mengecek DNS..." : "Verifikasi DNS"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function SettingsPanel({
  site,
  setSite,
  saveCloud,
}: {
  site: SiteState;
  setSite: SetSite;
  saveCloud: () => Promise<void>;
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

        <button className={styles.primary} onClick={saveCloud}>Simpan Workspace</button>
      </div>
    </section>
  );
}
