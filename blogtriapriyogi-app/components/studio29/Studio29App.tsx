"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./Studio29.module.css";
import { TemplateItem, defaultTemplate, makeTemplates } from "./templates";

type View = "dashboard" | "editor" | "posts" | "pages" | "templates" | "theme" | "html" | "domains" | "settings";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Review" | "Published";
  body: string;
};

type Site = {
  brand: string;
  slug: string;
  customDomain: string;
  template: TemplateItem;
  html: string;
};

const menu = [
  ["dashboard", "▣", "Dashboard", "/dashboard"],
  ["editor", "✎", "Editor Post", "/editor"],
  ["posts", "☰", "Post Library", "/posts"],
  ["pages", "▤", "Page Builder", "/pages"],
  ["templates", "◫", "Template Market", "/templates"],
  ["theme", "◐", "Theme Editor", "/theme"],
  ["html", "</>", "HTML Editor", "/html"],
  ["domains", "◎", "Domain Center", "/domains"],
  ["settings", "⌘", "Settings", "/settings"],
] as const;

const defaultSite: Site = {
  brand: "Tri Apri Yogi",
  slug: "tri-apri-yogi",
  customDomain: "",
  template: defaultTemplate,
  html: "<section><h1>Judul custom</h1><p>Edit HTML ini dari studio.</p></section>",
};

const defaultPosts: Post[] = [
  {
    id: "p1",
    title: "Artikel Pertama",
    slug: "artikel-pertama",
    status: "Draft",
    body: "Isi artikel pertama.",
  },
];

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export default function Studio29App({ view }: { view: View }) {
  const templates = useMemo(() => makeTemplates(), []);
  const [open, setOpen] = useState(false);
  const [site, setSite] = useState<Site>(defaultSite);
  const [posts, setPosts] = useState<Post[]>(defaultPosts);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setSite(getStored("studio29.site", defaultSite));
    setPosts(getStored("studio29.posts", defaultPosts));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studio29.site", JSON.stringify(site));
  }, [site]);

  useEffect(() => {
    window.localStorage.setItem("studio29.posts", JSON.stringify(posts));
  }, [posts]);

  const siteUrl = `https://${site.slug || "my-site"}.triapriyogi.com`;

  function savePost() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert("Judul belum diisi.");
      return;
    }

    const next: Post = {
      id: `post-${Date.now()}`,
      title: cleanTitle,
      slug: makeSlug(cleanTitle),
      status: "Draft",
      body,
    };

    setPosts((items) => [next, ...items]);
    setTitle("");
    setBody("");
    alert("Post tersimpan.");
  }

  function updatePost(id: string, status: Post["status"]) {
    setPosts((items) => items.map((post) => post.id === id ? { ...post, status } : post));
  }

  function deletePost(id: string) {
    setPosts((items) => items.filter((post) => post.id !== id));
  }

  function openSite() {
    window.open(siteUrl, "_blank");
  }

  function openPost(post: Post) {
    window.open(`${siteUrl}/blog/${post.slug}?title=${encodeURIComponent(post.title)}`, "_blank");
  }

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <button className={styles.toggle} onClick={() => setOpen((value) => !value)}>▦</button>

        <div className={styles.brand}>
          <div className={styles.logo}>TA</div>
          <div className={styles.brandText}>
            <strong>{site.brand}</strong>
            <span>Builder 29</span>
          </div>
        </div>

        <nav className={styles.menu}>
          {menu.map(([key, icon, label, href]) => (
            <Link key={key} href={href} className={`${styles.link} ${view === key ? styles.active : ""}`}>
              <span className={styles.icon}>{icon}</span>
              <span className={styles.label}>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <div className={styles.topbar}>
            <div className={styles.search}>
              <input placeholder="Cari post, halaman, template, domain, atau pengaturan..." />
            </div>

            <div className={styles.actions}>
              <button className={styles.secondary} onClick={openSite}>Buka Website</button>
              <Link className={styles.primary} href="/editor">Buat Post</Link>
            </div>
          </div>

          <div className={styles.hero}>
            <div>
              <div className={styles.kicker}>Upgrade 29</div>
              <h1>{heroTitle(view)}</h1>
              <p>{heroDesc(view)}</p>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.browser}>
                <div className={styles.browserTop}>{siteUrl}</div>
                <div className={styles.browserBody} style={{
                  background: site.template.palette.bg,
                  color: site.template.palette.text,
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 18,
                    background: site.template.palette.primary,
                    marginBottom: 18,
                  }} />
                  <h2 style={{ margin: 0, fontSize: 34, letterSpacing: "-.05em" }}>{site.brand}</h2>
                  <p style={{ color: "#64748b", lineHeight: 1.7 }}>Template aktif: {site.template.layout}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <Stats posts={posts} templates={templates} site={site} />

          {view === "dashboard" && <Dashboard site={site} posts={posts} openSite={openSite} />}
          {view === "editor" && <Editor title={title} body={body} setTitle={setTitle} setBody={setBody} savePost={savePost} />}
          {view === "posts" && <Posts posts={posts} updatePost={updatePost} deletePost={deletePost} openPost={openPost} />}
          {view === "templates" && <Templates templates={templates} site={site} setSite={setSite} />}
          {view === "theme" && <Theme site={site} setSite={setSite} />}
          {view === "html" && <HtmlEditor site={site} setSite={setSite} />}
          {view === "domains" && <Domains site={site} setSite={setSite} openSite={openSite} />}
          {view === "settings" && <Settings site={site} setSite={setSite} />}
          {view === "pages" && <Pages />}
        </div>
      </section>
    </main>
  );
}

function heroTitle(view: View) {
  const map: Record<View, string> = {
    dashboard: "Website builder untuk banyak jenis usaha.",
    editor: "Editor post yang siap preview.",
    posts: "Semua post bisa dibuka di tab baru.",
    pages: "Bangun halaman dari blok visual.",
    templates: "1000 variasi template siap dipakai.",
    theme: "Ubah warna dan identitas visual.",
    html: "Edit HTML langsung dari studio.",
    domains: "Subdomain gratis dan custom domain.",
    settings: "Atur identitas dan mode kerja.",
  };
  return map[view];
}

function heroDesc(view: View) {
  const map: Record<View, string> = {
    dashboard: "Satu ruang kerja untuk blog, situs, brand, toko, bisnis, jasa, portofolio, dan halaman publik.",
    editor: "Tulis konten, simpan draft, terbitkan, lalu buka hasilnya sebagai halaman publik.",
    posts: "Kelola status konten, buka preview, dan pantau daftar publikasi.",
    pages: "Siapkan homepage, halaman produk, harga, kontak, profil, dan halaman promosi.",
    templates: "Template dibuat dari kombinasi layout, kategori, dan palet warna yang benar-benar mengubah tampilan.",
    theme: "Atur warna utama, background, kartu, dan gaya visual situs.",
    html: "Tambahkan kode HTML custom untuk blok khusus.",
    domains: "Setiap user punya subdomain gratis dan bisa menyiapkan domain pribadi.",
    settings: "Kelola nama website, slug, domain, dan identitas utama.",
  };
  return map[view];
}

function Stats({ posts, templates, site }: { posts: Post[]; templates: TemplateItem[]; site: Site }) {
  return (
    <div className={styles.stats}>
      <Stat label="Post" value={String(posts.length)} />
      <Stat label="Template" value={String(templates.length)} />
      <Stat label="Subdomain" value={`${site.slug}.triapriyogi.com`} />
      <Stat label="Status" value="Aktif" />
    </div>
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

function Dashboard({ site, posts, openSite }: { site: Site; posts: Post[]; openSite: () => void }) {
  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Ruang kerja utama</h2>
        <div className={styles.cards}>
          <Card title="Subdomain gratis" text={`${site.slug}.triapriyogi.com`} />
          <Card title="Template aktif" text={site.template.name} />
          <Card title="Post tersimpan" text={`${posts.length} konten`} />
          <Card title="Preview publik" text="Buka website di tab baru." />
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Aksi cepat</h2>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={openSite}>Buka Website</button>
          <Link className={styles.secondary} href="/templates">Pilih Template</Link>
          <Link className={styles.secondary} href="/theme">Edit Tema</Link>
          <Link className={styles.secondary} href="/domains">Atur Domain</Link>
        </div>
      </section>
    </div>
  );
}

function Editor(props: {
  title: string;
  body: string;
  setTitle: (value: string) => void;
  setBody: (value: string) => void;
  savePost: () => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Editor post</h2>
      <div className={styles.form}>
        <input className={styles.input} value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="Judul post" />
        <textarea className={styles.textarea} value={props.body} onChange={(e) => props.setBody(e.target.value)} placeholder="Tulis isi post..." />
        <button className={styles.primary} onClick={props.savePost}>Simpan Post</button>
      </div>
    </section>
  );
}

function Posts({ posts, updatePost, deletePost, openPost }: {
  posts: Post[];
  updatePost: (id: string, status: Post["status"]) => void;
  deletePost: (id: string) => void;
  openPost: (post: Post) => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Post library</h2>
      {posts.map((post) => (
        <div className={styles.row} key={post.id}>
          <div>
            <strong>{post.title}</strong>
            <div className={styles.small}>/{post.slug}</div>
          </div>
          <span className={styles.badge}>{post.status}</span>
          <button className={styles.secondary} onClick={() => openPost(post)}>View</button>
          <div className={styles.actions}>
            <button className={styles.secondary} onClick={() => updatePost(post.id, "Review")}>Review</button>
            <button className={styles.primary} onClick={() => updatePost(post.id, "Published")}>Terbit</button>
            <button className={styles.danger} onClick={() => deletePost(post.id)}>Hapus</button>
          </div>
        </div>
      ))}
    </section>
  );
}

function Templates({ templates, site, setSite }: {
  templates: TemplateItem[];
  site: Site;
  setSite: (site: Site) => void;
}) {
  return (
    <section className={styles.panel}>
      <h2>Template market</h2>
      <div className={styles.templates}>
        {templates.slice(0, 24).map((tpl) => (
          <div className={styles.templateCard} key={tpl.id}>
            <div className={styles.templateVisual} style={{
              background: `linear-gradient(135deg, ${tpl.palette.primary}, ${tpl.palette.soft})`,
            }} />
            <strong>{tpl.name}</strong>
            <div className={styles.small}>{tpl.category} · {tpl.layout}</div>
            <button className={styles.primary} style={{ marginTop: 14 }} onClick={() => setSite({ ...site, template: tpl })}>
              Pakai Template
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Theme({ site, setSite }: { site: Site; setSite: (site: Site) => void }) {
  function updateColor(key: keyof Site["template"]["palette"], value: string) {
    setSite({
      ...site,
      template: {
        ...site.template,
        palette: {
          ...site.template.palette,
          [key]: value,
        },
      },
    });
  }

  return (
    <section className={styles.panel}>
      <h2>Theme editor</h2>
      <div className={styles.form}>
        <input className={styles.input} type="color" value={site.template.palette.primary} onChange={(e) => updateColor("primary", e.target.value)} />
        <input className={styles.input} type="color" value={site.template.palette.bg} onChange={(e) => updateColor("bg", e.target.value)} />
        <input className={styles.input} type="color" value={site.template.palette.text} onChange={(e) => updateColor("text", e.target.value)} />
      </div>
    </section>
  );
}

function HtmlEditor({ site, setSite }: { site: Site; setSite: (site: Site) => void }) {
  return (
    <section className={styles.panel}>
      <h2>HTML editor</h2>
      <div className={styles.form}>
        <textarea className={styles.textarea} value={site.html} onChange={(e) => setSite({ ...site, html: e.target.value })} />
        <div className={styles.panel}>
          <h2>Preview HTML</h2>
          <div dangerouslySetInnerHTML={{ __html: site.html }} />
        </div>
      </div>
    </section>
  );
}

function Domains({ site, setSite, openSite }: { site: Site; setSite: (site: Site) => void; openSite: () => void }) {
  return (
    <section className={styles.panel}>
      <h2>Domain center</h2>
      <div className={styles.form}>
        <input className={styles.input} value={site.slug} onChange={(e) => setSite({ ...site, slug: makeSlug(e.target.value) })} placeholder="nama-subdomain" />
        <input className={styles.input} value={site.customDomain} onChange={(e) => setSite({ ...site, customDomain: e.target.value })} placeholder="domain pribadi" />
        <button className={styles.primary} onClick={openSite}>Buka Subdomain</button>
      </div>
    </section>
  );
}

function Settings({ site, setSite }: { site: Site; setSite: (site: Site) => void }) {
  return (
    <section className={styles.panel}>
      <h2>Settings</h2>
      <div className={styles.form}>
        <input className={styles.input} value={site.brand} onChange={(e) => setSite({ ...site, brand: e.target.value })} />
        <input className={styles.input} value={site.slug} onChange={(e) => setSite({ ...site, slug: makeSlug(e.target.value) })} />
      </div>
    </section>
  );
}

function Pages() {
  return (
    <section className={styles.panel}>
      <h2>Page builder</h2>
      <div className={styles.cards}>
        <Card title="Homepage" text="Bangun halaman utama." />
        <Card title="Produk" text="Tampilkan produk atau layanan." />
        <Card title="Harga" text="Tampilkan paket dan benefit." />
        <Card title="Kontak" text="Hubungkan pengunjung ke pemilik website." />
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
