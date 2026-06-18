"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import "../../components/dashboard.css";

type View =
  | "home"
  | "posts"
  | "pages"
  | "media"
  | "theme"
  | "layout"
  | "stats"
  | "revenue"
  | "seo"
  | "ai"
  | "domain"
  | "integrations"
  | "users"
  | "api"
  | "settings";

type DomainItem = {
  id: string;
  kind: "Domain" | "Subdomain";
  value: string;
  status: string;
};

type PostItem = {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>("home");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("Kreator");

  const [totalPosts, setTotalPosts] = useState(0);
  const [publishedPosts, setPublishedPosts] = useState(0);
  const [draftPosts, setDraftPosts] = useState(0);
  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);

  const [mainDomain, setMainDomain] = useState("triapriyogi.com");
  const [domainInput, setDomainInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [notice, setNotice] = useState("");

  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((item) => item[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name]);

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const userEmail = data.user.email || "";
      const userName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        userEmail.split("@")[0] ||
        "Kreator";

      setEmail(userEmail);
      setName(userName);

      const savedMainDomain = localStorage.getItem("tri_main_domain");
      const savedDomains = localStorage.getItem("tri_domains");

      if (savedMainDomain) setMainDomain(savedMainDomain);

      if (savedDomains) {
        try {
          setDomains(JSON.parse(savedDomains));
        } catch {
          setDomains([]);
        }
      }

      await loadPosts();
      setReady(true);
    }

    loadDashboard();
  }, [router]);

  async function loadPosts() {
    const total = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true });

    if (!total.error && typeof total.count === "number") {
      setTotalPosts(total.count);
    }

    const published = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    if (!published.error && typeof published.count === "number") {
      setPublishedPosts(published.count);
    }

    const draft = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft");

    if (!draft.error && typeof draft.count === "number") {
      setDraftPosts(draft.count);
    }

    const latest = await supabase
      .from("posts")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!latest.error && latest.data) {
      setRecentPosts(latest.data as PostItem[]);
    }
  }

  function cleanDomain(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .replaceAll("/", "");
  }

  function saveMainDomain() {
    const clean = cleanDomain(mainDomain);

    if (!clean.includes(".")) {
      setNotice("Domain utama belum valid. Contoh: triapriyogi.com");
      return;
    }

    setMainDomain(clean);
    localStorage.setItem("tri_main_domain", clean);
    setNotice("Domain utama berhasil disimpan.");
  }

  function addDomain() {
    const clean = cleanDomain(domainInput);

    if (!clean.includes(".")) {
      setNotice("Custom domain belum valid. Contoh: bloganda.com");
      return;
    }

    const next = [
      {
        id: crypto.randomUUID(),
        kind: "Domain" as const,
        value: clean,
        status: "Menunggu DNS",
      },
      ...domains,
    ];

    setDomains(next);
    localStorage.setItem("tri_domains", JSON.stringify(next));
    setDomainInput("");
    setNotice("Custom domain ditambahkan. Selanjutnya sambungkan di Vercel dan DNS.");
  }

  function addSubdomain() {
    const clean = subInput
      .trim()
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("/", "")
      .replace("https://", "")
      .replace("http://", "")
      .replace(`.${cleanDomain(mainDomain)}`, "");

    if (!clean || clean.includes(".")) {
      setNotice("Subdomain cukup isi nama depan saja. Contoh: blog, news, studio.");
      return;
    }

    const next = [
      {
        id: crypto.randomUUID(),
        kind: "Subdomain" as const,
        value: `${clean}.${cleanDomain(mainDomain)}`,
        status: "Menunggu DNS",
      },
      ...domains,
    ];

    setDomains(next);
    localStorage.setItem("tri_domains", JSON.stringify(next));
    setSubInput("");
    setNotice("Subdomain ditambahkan. Selanjutnya buat DNS record agar aktif.");
  }

  function removeDomain(id: string) {
    const next = domains.filter((item) => item.id !== id);
    setDomains(next);
    localStorage.setItem("tri_domains", JSON.stringify(next));
    setNotice("Domain dihapus dari dashboard.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const menuGroups = [
    {
      title: "Beranda",
      items: [
        {
          view: "home",
          label: "Dashboard",
          icon: "▦",
          child: ["Beranda", "Aktivitas", "Notifikasi"],
        },
      ],
    },
    {
      title: "Konten",
      items: [
        {
          view: "posts",
          label: "Postingan",
          icon: "▤",
          child: ["Semua post", "Post baru", "Draft", "Terjadwal", "Sampah", "Revisi"],
        },
        {
          view: "pages",
          label: "Halaman",
          icon: "▧",
          child: ["Semua halaman", "Halaman baru"],
        },
        {
          view: "media",
          label: "Media",
          icon: "▣",
          child: ["Semua media", "Gambar", "Video", "Dokumen", "WebP"],
        },
      ],
    },
    {
      title: "Tampilan",
      items: [
        {
          view: "theme",
          label: "Tema",
          icon: "◐",
          child: ["Galeri tema", "Edit HTML", "Mobile", "Desktop", "Cadangkan", "Pulihkan"],
        },
        {
          view: "layout",
          label: "Tata Letak",
          icon: "▥",
          child: ["Layout utama", "Header", "Footer", "Sidebar", "Widget"],
        },
      ],
    },
    {
      title: "Pertumbuhan",
      items: [
        {
          view: "stats",
          label: "Statistik",
          icon: "↗",
          child: ["Ringkasan", "Hari", "Minggu", "Bulan", "Tahun", "Real-time"],
        },
        {
          view: "revenue",
          label: "Penghasilan",
          icon: "$",
          child: ["Ringkasan", "Sponsor", "Afiliasi", "Iklan"],
        },
        {
          view: "seo",
          label: "SEO",
          icon: "⌕",
          child: ["Sitemap", "Schema", "Meta Tags", "Robots", "Indexing"],
        },
      ],
    },
    {
      title: "AI Studio",
      items: [
        {
          view: "ai",
          label: "AI Tools",
          icon: "✦",
          child: ["Chat AI", "Generate Artikel", "Rewrite", "SEO AI", "Image Gen", "Research"],
        },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        {
          view: "settings",
          label: "Pengaturan",
          icon: "⚙",
          child: ["Umum", "Brand", "Bahasa", "Keamanan"],
        },
        {
          view: "domain",
          label: "Domain",
          icon: "◎",
          child: ["Domain utama", "Subdomain", "Custom domain", "DNS"],
        },
        {
          view: "integrations",
          label: "Integrasi",
          icon: "⌁",
          child: ["Google", "LinkedIn", "Supabase", "Vercel", "Cloudflare", "OpenAI"],
        },
        {
          view: "users",
          label: "Pengguna",
          icon: "♙",
          child: ["Admin", "Penulis", "Editor", "Pembaca"],
        },
        {
          view: "api",
          label: "API",
          icon: "<>",
          child: ["Docs", "Keys", "Webhooks"],
        },
      ],
    },
  ];

  if (!ready) {
    return (
      <main className="dash-loading">
        <div>
          <span>TA</span>
          <h1>Memuat dashboard...</h1>
          <p>Menyiapkan pusat kendali.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dash">
      <aside className={menuOpen ? "dash-sidebar open" : "dash-sidebar"}>
        <div className="dash-brand">
          <Link href="/">
            <span>TA</span>
            <div>
              <b>TriBlog</b>
              <small>Creator Platform</small>
            </div>
          </Link>
          <button onClick={() => setMenuOpen(false)}>×</button>
        </div>

        <div className="dash-menu">
          {menuGroups.map((group) => (
            <section key={group.title}>
              <p>{group.title}</p>

              {group.items.map((item) => (
                <div key={item.view}>
                  <button
                    className={view === item.view ? "active" : ""}
                    onClick={() => {
                      setView(item.view as View);
                      setMenuOpen(false);
                    }}
                  >
                    <span>{item.icon}</span>
                    <b>{item.label}</b>
                    <i>›</i>
                  </button>

                  {view === item.view && (
                    <div className="dash-submenu">
                      {item.child.map((child) => (
                        <small key={child}>{child}</small>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>
      </aside>

      {menuOpen && <button className="dash-overlay" onClick={() => setMenuOpen(false)} />}

      <section className="dash-main">
        <header className="dash-topbar">
          <button className="dash-hamburger" onClick={() => setMenuOpen(true)}>
            ☰
          </button>

          <div className="dash-search">
            <span>⌕</span>
            <input placeholder="Cari post, halaman, domain, media..." />
          </div>

          <div className="dash-top-actions">
            <button>✦ AI Assistant</button>
            <button>🔔</button>
            <button className="dash-avatar">{initials}</button>
          </div>
        </header>

        {notice && (
          <div className="dash-notice">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        {view === "home" && (
          <section className="dash-content">
            <div className="dash-title">
              <div>
                <p>Dashboard</p>
                <h1>Selamat datang kembali</h1>
                <span>
                  {name} · {email}
                </span>
              </div>

              <div>
                <Link href="/editor">+ Post baru</Link>
                <button onClick={logout}>Keluar</button>
              </div>
            </div>

            <div className="dash-hero">
              <div>
                <small>TriApriyogi Studio</small>
                <h2>Kelola blog, konten, domain, SEO, dan AI dalam satu ruang kerja.</h2>
                <p>
                  Dashboard modern untuk menulis, mengatur website, melihat performa,
                  dan menyiapkan pertumbuhan blog.
                </p>
                <div>
                  <Link href="/editor">Mulai menulis</Link>
                  <button onClick={() => setView("domain")}>Atur domain</button>
                </div>
              </div>

              <aside>
                <b>{mainDomain}</b>
                <span>Domain utama</span>
                <em>Siap dikonfigurasi</em>
              </aside>
            </div>

            <div className="dash-stats">
              <article>
                <span>Total kunjungan</span>
                <b>0</b>
                <small>Analytics segera disambungkan</small>
              </article>
              <article>
                <span>Total post</span>
                <b>{totalPosts}</b>
                <small>Semua artikel</small>
              </article>
              <article>
                <span>Dipublikasi</span>
                <b>{publishedPosts}</b>
                <small>Artikel tayang</small>
              </article>
              <article>
                <span>Draft</span>
                <b>{draftPosts}</b>
                <small>Belum dipublikasi</small>
              </article>
            </div>

            <div className="dash-grid-two">
              <Panel title="Post terbaru" label="Konten" action="/editor" actionText="Tulis artikel">
                {recentPosts.length ? (
                  recentPosts.map((post) => (
                    <div className="dash-row" key={post.id}>
                      <div>
                        <b>{post.title || "Tanpa judul"}</b>
                        <small>
                          {post.created_at
                            ? new Date(post.created_at).toLocaleDateString("id-ID")
                            : "Tanggal belum ada"}
                        </small>
                      </div>
                      <span>{post.status || "draft"}</span>
                    </div>
                  ))
                ) : (
                  <div className="dash-empty">
                    <b>Belum ada post.</b>
                    <small>Buat artikel pertama dari tombol Post baru.</small>
                  </div>
                )}
              </Panel>

              <Panel title="Aksi cepat" label="Shortcut">
                <div className="dash-shortcuts">
                  <button onClick={() => setView("domain")}>Domain & subdomain</button>
                  <button onClick={() => setView("seo")}>SEO tools</button>
                  <button onClick={() => setView("ai")}>AI tools</button>
                  <button onClick={() => setView("integrations")}>Integrasi</button>
                </div>
              </Panel>
            </div>
          </section>
        )}

        {view === "domain" && (
          <section className="dash-content">
            <div className="dash-title">
              <div>
                <p>Domain</p>
                <h1>Kelola domain dan subdomain</h1>
                <span>Simpan domain utama, custom domain, dan subdomain blog.</span>
              </div>
            </div>

            <div className="dash-domain-grid">
              <Panel title="Domain utama" label="Website">
                <label>
                  Domain utama
                  <input
                    value={mainDomain}
                    onChange={(e) => setMainDomain(e.target.value)}
                    placeholder="triapriyogi.com"
                  />
                </label>
                <button className="dash-primary" onClick={saveMainDomain}>
                  Simpan domain utama
                </button>
              </Panel>

              <Panel title="Subdomain" label="Blog">
                <label>
                  Nama subdomain
                  <div className="dash-domain-input">
                    <input
                      value={subInput}
                      onChange={(e) => setSubInput(e.target.value)}
                      placeholder="blog"
                    />
                    <span>.{cleanDomain(mainDomain)}</span>
                  </div>
                </label>
                <button className="dash-primary" onClick={addSubdomain}>
                  Tambah subdomain
                </button>
              </Panel>

              <Panel title="Custom domain" label="Domain">
                <label>
                  Domain tambahan
                  <input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="domainanda.com"
                  />
                </label>
                <button className="dash-primary" onClick={addDomain}>
                  Tambah custom domain
                </button>
              </Panel>

              <Panel title="Instruksi DNS" label="Koneksi">
                <div className="dash-dns">
                  <div>
                    <b>1. Tambahkan di Vercel</b>
                    <small>Project Settings → Domains.</small>
                  </div>
                  <div>
                    <b>2. Arahkan DNS</b>
                    <small>Gunakan Cloudflare atau registrar domain.</small>
                  </div>
                  <div>
                    <b>3. Tambahkan redirect</b>
                    <small>Supabase Auth → URL Configuration.</small>
                  </div>
                </div>
              </Panel>
            </div>

            <Panel title="Daftar domain tersimpan" label="Records">
              <div className="dash-table">
                <div className="head">
                  <span>Jenis</span>
                  <span>Domain</span>
                  <span>Status</span>
                  <span>Aksi</span>
                </div>

                <div className="item">
                  <span>Utama</span>
                  <b>{cleanDomain(mainDomain)}</b>
                  <em>Tersimpan</em>
                  <button disabled>Utama</button>
                </div>

                {domains.map((item) => (
                  <div className="item" key={item.id}>
                    <span>{item.kind}</span>
                    <b>{item.value}</b>
                    <em>{item.status}</em>
                    <button onClick={() => removeDomain(item.id)}>Hapus</button>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {view === "integrations" && (
          <Module
            title="Integrasi"
            subtitle="Hubungkan Google, LinkedIn, Supabase, Vercel, Cloudflare, dan AI provider."
          />
        )}

        {view !== "home" && view !== "domain" && view !== "integrations" && (
          <Module title={moduleTitle(view)} subtitle={moduleSubtitle(view)} />
        )}
      </section>
    </main>
  );
}

function Panel({
  title,
  label,
  children,
  action,
  actionText,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
  action?: string;
  actionText?: string;
}) {
  return (
    <article className="dash-panel">
      <div className="dash-panel-head">
        <div>
          <p>{label}</p>
          <h2>{title}</h2>
        </div>
        {action && actionText && <Link href={action}>{actionText}</Link>}
      </div>
      {children}
    </article>
  );
}

function Module({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="dash-content">
      <div className="dash-title">
        <div>
          <p>Module</p>
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
      </div>

      <div className="dash-grid-two">
        <Panel title={title} label="Fitur">
          <div className="dash-empty">
            <b>Ruang kerja sudah disiapkan.</b>
            <small>Menu ini siap dikembangkan ke database dan fitur detail berikutnya.</small>
          <EOF
