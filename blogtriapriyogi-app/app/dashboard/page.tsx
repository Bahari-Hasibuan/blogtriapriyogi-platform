"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import DomainSettings from "../../components/DomainSettings";
import PostsManager from "../../components/PostsManager";
import "../../components/dashboard.css";

type View =
  | "home"
  | "activity"
  | "posts"
  | "newPost"
  | "drafts"
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

type NavItem = {
  view: View;
  label: string;
  icon: string;
  child: string[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type PostItem = {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type DomainItem = {
  id: string;
  kind: "Domain" | "Subdomain";
  value: string;
  status: string;
};

type SiteDomainItem = {
  id: string;
  domain_type: "system_subdomain" | "custom_domain";
  hostname: string;
  status: string;
  is_primary: boolean;
  verification_token?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const menuGroups: NavGroup[] = [
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
        child: ["Semua halaman", "Halaman baru", "Privacy", "Terms", "Contact"],
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
        child: ["Identitas platform", "Subdomain", "Custom domain", "DNS"],
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

const moduleCopy: Record<View, { title: string; subtitle: string }> = {
  home: {
    title: "Dashboard",
    subtitle: "Ringkasan website, performa, domain, dan aktivitas konten.",
  },
  activity: {
    title: "Aktivitas",
    subtitle: "Pantau aktivitas terbaru dari konten, login, dan sistem.",
  },
  posts: {
    title: "Postingan",
    subtitle: "Kelola semua post, draft, jadwal, revisi, dan sampah.",
  },
  newPost: {
    title: "Post baru",
    subtitle: "Mulai tulis artikel baru dari ruang editor.",
  },
  drafts: {
    title: "Draft",
    subtitle: "Kelola artikel yang belum dipublikasikan.",
  },
  pages: {
    title: "Halaman",
    subtitle: "Kelola halaman About, Contact, Privacy, Terms, dan halaman statis lain.",
  },
  media: {
    title: "Media",
    subtitle: "Kelola gambar, video, dokumen, dan file WebP.",
  },
  theme: {
    title: "Tema",
    subtitle: "Atur tampilan, mode mobile, desktop, backup, dan restore.",
  },
  layout: {
    title: "Tata Letak",
    subtitle: "Atur layout utama, header, footer, sidebar, dan widget.",
  },
  stats: {
    title: "Statistik",
    subtitle: "Pantau kunjungan, negara, perangkat, referrer, dan real-time analytics.",
  },
  revenue: {
    title: "Penghasilan",
    subtitle: "Kelola sponsor, iklan, afiliasi, dan sumber penghasilan.",
  },
  seo: {
    title: "SEO",
    subtitle: "Kelola sitemap, robots, schema, meta tags, dan indexing.",
  },
  ai: {
    title: "AI Tools",
    subtitle: "Gunakan AI untuk artikel, rewrite, SEO, ide gambar, dan research.",
  },
  domain: {
    title: "Domain",
    subtitle: "Kelola domain utama, custom domain, subdomain, dan instruksi DNS.",
  },
  integrations: {
    title: "Integrasi",
    subtitle: "Hubungkan Google, LinkedIn, Supabase, Vercel, Cloudflare, dan AI provider.",
  },
  users: {
    title: "Pengguna",
    subtitle: "Kelola admin, penulis, editor, pembaca, dan hak akses.",
  },
  api: {
    title: "API",
    subtitle: "Kelola dokumentasi, keys, dan webhooks.",
  },
  settings: {
    title: "Pengaturan",
    subtitle: "Atur brand, bahasa, keamanan, email, dan preferensi.",
  },
};

export default function DashboardPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>("home");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("Kreator");

  const [blogName, setBlogName] = useState("Tri Apriyogi Studio");
  const [blogSlug, setBlogSlug] = useState("tri-apriyogi-studio");
  const [blogCategory, setBlogCategory] = useState("Personal Brand");
  const [siteDescription, setSiteDescription] = useState(
    "Platform digital untuk blog, website, bisnis, brand, dan publikasi profesional."
  );

  const [totalPosts, setTotalPosts] = useState(0);
  const [publishedPosts, setPublishedPosts] = useState(0);
  const [draftPosts, setDraftPosts] = useState(0);
  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);

  const [mainDomain, setMainDomain] = useState("triapriyogi.com");
  const [domainInput, setDomainInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [notice, setNotice] = useState("");

  const [publicSlugInput, setPublicSlugInput] = useState("");
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [siteDomains, setSiteDomains] = useState<SiteDomainItem[]>([]);
  const [domainSaving, setDomainSaving] = useState(false);

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("blog_name, blog_slug, blog_category, site_description")
        .eq("id", data.user.id)
        .single();

      if (
        !profile?.blog_name ||
        profile.blog_name === "Blog TriApriyogi" ||
        profile.blog_name.trim().length < 3
      ) {
        router.replace("/onboarding");
        return;
      }

      const activeBlogName = profile.blog_name.trim();
      const activeBlogSlug = profile.blog_slug || makeBlogSlug(activeBlogName);
      const activeBlogCategory = profile.blog_category || "Personal Brand";
      const activeDescription =
        profile.site_description ||
        `${activeBlogName} adalah platform digital profesional.`;

      setBlogName(activeBlogName);
      setBlogSlug(activeBlogSlug);
      setBlogCategory(activeBlogCategory);
      setSiteDescription(activeDescription);
      setSubInput(activeBlogSlug);

      localStorage.setItem("tri_blog_name", activeBlogName);
      localStorage.setItem("tri_blog_slug", activeBlogSlug);
      localStorage.setItem("tri_blog_category", activeBlogCategory);

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

  function makePublicSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
  }

  function isReservedPublicSlug(value: string) {
    const reserved = new Set([
      "www",
      "studio",
      "workspace",
      "app",
      "admin",
      "api",
      "auth",
      "login",
      "signup",
      "dashboard",
      "editor",
      "settings",
      "mail",
      "email",
      "support",
      "help",
      "blog",
      "terms",
      "privacy",
    ]);

    return reserved.has(value);
  }

  function cleanCustomHostname(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .replaceAll("/", "");
  }

  async function loadSiteDomains(userId?: string) {
    let activeUserId = userId;

    if (!activeUserId) {
      const { data } = await supabase.auth.getUser();
      activeUserId = data.user?.id;
    }

    if (!activeUserId) return;

    const { data, error } = await supabase
      .from("site_domains")
      .select("id,domain_type,hostname,status,is_primary,verification_token,created_at,updated_at")
      .eq("user_id", activeUserId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSiteDomains(data as SiteDomainItem[]);
    }
  }

  async function savePublicAddress() {
    const nextSlug = makePublicSlug(publicSlugInput || blogSlug || blogName);

    if (nextSlug.length < 3) {
      setNotice("Alamat publik minimal 3 karakter.");
      return;
    }

    if (isReservedPublicSlug(nextSlug)) {
      setNotice("Alamat ini tidak bisa dipakai karena termasuk nama sistem.");
      return;
    }

    setDomainSaving(true);

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setDomainSaving(false);
      router.replace("/login");
      return;
    }

    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("blog_slug", nextSlug)
      .neq("id", data.user.id)
      .maybeSingle();

    if (taken?.id) {
      setDomainSaving(false);
      setNotice("Alamat ini sudah dipakai pengguna lain. Pilih nama lain.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        blog_slug: nextSlug,
        blog_slug_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);

    if (error) {
      setDomainSaving(false);
      setNotice("Gagal menyimpan alamat publik.");
      return;
    }

    await supabase
      .from("site_domains")
      .delete()
      .eq("user_id", data.user.id)
      .eq("domain_type", "system_subdomain");

    await supabase.from("site_domains").insert({
      user_id: data.user.id,
      domain_type: "system_subdomain",
      hostname: `${nextSlug}.triapriyogi.com`,
      status: "active",
      is_primary: true,
    });

    setBlogSlug(nextSlug);
    setPublicSlugInput(nextSlug);
    localStorage.setItem("tri_blog_slug", nextSlug);

    await loadSiteDomains(data.user.id);

    setDomainSaving(false);
    setNotice("Alamat publik berhasil disimpan.");
  }

  async function addCustomDomainSetting() {
    const hostname = cleanCustomHostname(customDomainInput);

    if (!hostname.includes(".")) {
      setNotice("Custom domain belum valid. Contoh: blogbrian.com");
      return;
    }

    if (hostname.endsWith(".triapriyogi.com") || hostname === "triapriyogi.com") {
      setNotice("Subdomain triapriyogi.com diatur dari alamat publik, bukan custom domain.");
      return;
    }

    setDomainSaving(true);

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setDomainSaving(false);
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("site_domains").insert({
      user_id: data.user.id,
      domain_type: "custom_domain",
      hostname,
      status: "pending",
      is_primary: false,
    });

    if (error) {
      setDomainSaving(false);
      setNotice("Gagal menambahkan domain. Mungkin domain sudah dipakai akun lain.");
      return;
    }

    setCustomDomainInput("");
    await loadSiteDomains(data.user.id);

    setDomainSaving(false);
    setNotice("Custom domain ditambahkan. Lanjut arahkan DNS ke Vercel.");
  }

  async function removeSiteDomain(id: string) {
    const { error } = await supabase.from("site_domains").delete().eq("id", id);

    if (error) {
      setNotice("Gagal menghapus domain.");
      return;
    }

    await loadSiteDomains();
    setNotice("Domain berhasil dihapus.");
  }

  function makeBlogSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
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
      setNotice("Identitas platform belum valid. Contoh: triapriyogi.com");
      return;
    }

    setMainDomain(clean);
    localStorage.setItem("tri_main_domain", clean);
    setNotice("Identitas platform berhasil disimpan.");
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

  async function saveProfileSettings() {
    const cleanName = blogName.trim();
    const cleanSlug = makeBlogSlug(blogSlug || blogName);

    if (cleanName.length < 3) {
      setNotice("Nama Blog / Website / Bisnis minimal 3 karakter.");
      return;
    }

    if (cleanSlug.length < 3) {
      setNotice("Slug platform minimal 3 karakter.");
      return;
    }

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        blog_name: cleanName,
        blog_slug: cleanSlug,
        blog_category: blogCategory,
        site_description: siteDescription.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);

    if (error) {
      setNotice("Gagal menyimpan identitas platform. Pastikan kolom Supabase sudah dibuat.");
      return;
    }

    setBlogName(cleanName);
    setBlogSlug(cleanSlug);
    setSubInput(cleanSlug);

    localStorage.setItem("tri_blog_name", cleanName);
    localStorage.setItem("tri_blog_slug", cleanSlug);
    localStorage.setItem("tri_blog_category", blogCategory);

    setNotice("Identitas platform berhasil disimpan dan disinkronkan.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

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
              <b>{blogName}</b>
              <small>{blogCategory || "Creator Platform"}</small>
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
                      setView(item.view);
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

        <div className="dash-sidebar-footer">
          <div>
            <span className="dash-sidebar-avatar">{initials}</span>
            <div>
              <b>{name}</b>
              <small>{email || "Akun aktif"}</small>
            </div>
          </div>

          <button onClick={logout}>Keluar</button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="dash-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup menu"
        />
      )}

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
            <button type="button">✦ AI Assistant</button>
            <button type="button">🔔</button>
            <button type="button" className="dash-avatar">
              {initials}
            </button>
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
                <small>{blogName}</small>
                <h2>Kelola konten, identitas, SEO, dan AI dalam satu ruang kerja.</h2>
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
                <b>{blogName}</b>
                <span>Identitas platform</span>
                <em>Siap dipublikasikan</em>
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


        {view === "settings" && (
          <section className="dash-content">
            <div className="dash-title">
              <div>
                <p>Pengaturan</p>
                <h1>Identitas platform</h1>
                <span>Sinkronkan nama Blog, Website, Bisnis, Brand, slug, dan deskripsi SEO.</span>
              </div>
            </div>

            <div className="dash-grid-two">
              <Panel title="Profil platform" label="Identity">
                <div className="dash-settings-form">
                  <label>
                    Nama Blog / Website / Bisnis
                    <input
                      value={blogName}
                      onChange={(e) => {
                        setBlogName(e.target.value);
                        setBlogSlug(makeBlogSlug(e.target.value));
                      }}
                      placeholder="Contoh: Tri Apriyogi Digital"
                    />
                  </label>

                  <label>
                    Slug / alamat publik
                    <input
                      value={blogSlug}
                      onChange={(e) => setBlogSlug(makeBlogSlug(e.target.value))}
                      placeholder="tri-apriyogi-digital"
                    />
                    <small>Preview: {blogSlug || "nama-platform"}.triapriyogi.com</small>
                  </label>

                  <label>
                    Jenis platform
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                    >
                      <option>Personal Brand</option>
                      <option>Website Bisnis</option>
                      <option>Blog Profesional</option>
                      <option>Edukasi / Kursus</option>
                      <option>Media / Publikasi</option>
                      <option>Portofolio</option>
                      <option>Komunitas</option>
                    </select>
                  </label>

                  <label>
                    Deskripsi SEO
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      placeholder="Deskripsi singkat yang akan dibaca mesin pencari."
                    />
                  </label>

                  <button onClick={saveProfileSettings}>Simpan identitas platform</button>
                </div>
              </Panel>

              <Panel title="Preview mesin pencari" label="SEO">
                <div className="dash-seo-preview">
                  <small>{blogSlug || "nama-platform"}.triapriyogi.com</small>
                  <b>{blogName || "Nama Platform"}</b>
                  <p>{siteDescription}</p>
                </div>

                <div className="dash-dns">
                  <div>
                    <b>Google</b>
                    <small>Butuh halaman publik, sitemap, dan indexing.</small>
                  </div>
                  <div>
                    <b>Bing</b>
                    <small>Bisa dihubungkan lewat Bing Webmaster Tools.</small>
                  </div>
                  <div>
                    <b>Yandex</b>
                    <small>Bisa dibaca jika robots dan sitemap terbuka.</small>
                  </div>
                </div>
              </Panel>
            </div>
          </section>
        )}


        {view === "posts" && <PostsManager />}

        {view === "domain" && <DomainSettings />}

        {view === "integrations" && (
          <section className="dash-content">
            <div className="dash-title">
              <div>
                <p>Integrasi</p>
                <h1>Hubungkan layanan utama</h1>
                <span>Google, LinkedIn, Supabase, Vercel, Cloudflare, dan AI provider.</span>
              </div>
            </div>

            <div className="dash-integration-grid">
              <IntegrationCard title="Google Login" desc="Login sosial Google melalui Supabase Auth." status="Aktif" />
              <IntegrationCard title="LinkedIn Login" desc="Login LinkedIn OIDC melalui Supabase Auth." status="Aktif" />
              <IntegrationCard title="Email Auth" desc="Email dan password sudah tersambung ke Supabase." status="Aktif" />
              <IntegrationCard title="Supabase Database" desc="Menyimpan profiles, posts, dan data platform." status="Aktif" />
              <IntegrationCard title="Vercel Hosting" desc="Deploy otomatis dari GitHub ke production." status="Aktif" />
              <IntegrationCard title="Cloudflare DNS" desc="Disiapkan untuk cache, DNS, dan proteksi." status="DNS" />
              <IntegrationCard title="OpenAI" desc="Disiapkan untuk workflow AI writing assistant." status="Segera" />
              <IntegrationCard title="Analytics" desc="Disiapkan untuk traffic dan performa konten." status="Segera" />
            </div>
          </section>
        )}

        {view !== "home" && view !== "settings" && view !== "domain" && view !== "integrations" && (
          <Module title={moduleCopy[view].title} subtitle={moduleCopy[view].subtitle} />
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
            <small>
              Menu ini siap dikembangkan ke database dan fitur detail berikutnya.
            </small>
          </div>
        </Panel>

        <Panel title="Status" label="Sistem">
          <div className="dash-dns">
            <div>
              <b>UI aktif</b>
              <small>Menu sudah bisa dibuka.</small>
            </div>

            <div>
              <b>Tahap berikut</b>
              <small>Sambungkan tabel dan fungsi sesuai kebutuhan.</small>
            </div>

            <div>
              <b>Integrasi</b>
              <small>Siap dihubungkan dengan Supabase, Vercel, dan Cloudflare.</small>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function IntegrationCard({
  title,
  desc,
  status,
}: {
  title: string;
  desc: string;
  status: string;
}) {
  return (
    <article className="dash-integration-card">
      <div>
        <b>{title}</b>
        <small>{desc}</small>
      </div>

      <span className={status === "Aktif" ? "ready" : status === "DNS" ? "dns" : "soon"}>
        {status}
      </span>
    </article>
  );
}
