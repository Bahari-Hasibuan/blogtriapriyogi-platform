type Stat = {
  label: string
  value: string
  note?: string
}

type PanelRow = [string, string, string]

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <a className="brand" href="/">
      <span className="logo">TA</span>
      <span>
        <span className="brand-title" style={{ color: dark ? "#fff" : undefined }}>Tri Apri Yogi</span>
        <span className="brand-subtitle">Studio</span>
      </span>
    </a>
  )
}

export function PublicNav() {
  return (
    <header className="nav">
      <Brand />
      <nav className="nav-links">
        <a href="/#produk">Produk</a>
        <a href="/pricing">Harga</a>
        <a href="/security">Security</a>
        <a href="/status">Status</a>
      </nav>
      <div className="nav-actions">
        <a className="btn btn-light" href="/login">Login</a>
        <a className="btn btn-primary" href="/signup">Mulai</a>
      </div>
    </header>
  )
}

export function LandingPage() {
  const features = [
    ["Editor Canggih", "Tulis, edit, jadwalkan, dan kelola artikel dari satu ruang kerja yang nyaman."],
    ["SEO Tools", "Atur judul, slug, excerpt, meta description, canonical, dan struktur konten."],
    ["Domain Khusus", "Hubungkan domain pribadi, subdomain brand, dan alamat publik yang rapi."],
    ["AI Assistant", "Bantu ide artikel, outline, rewrite, optimasi struktur, dan ringkas konten."],
    ["Analytics", "Pantau trafik, performa konten, sumber pembaca, dan pertumbuhan blog."],
    ["Keamanan", "Atur role admin, editor, penulis, akses konten, dan konfigurasi platform."]
  ]

  const prices = [
    ["Gratis", "Rp0", "Untuk mulai menulis dan mencoba ruang kerja blog pribadi.", ["Editor dasar", "Subdomain publik", "Draft artikel", "SEO dasar"]],
    ["Pro", "Rp59K", "Untuk kreator yang ingin tampil lebih profesional.", ["Posting lebih fleksibel", "Domain pribadi", "AI writing tools", "Analytics lengkap"]],
    ["Bisnis", "Rp149K", "Untuk tim, brand, dan kebutuhan konten yang lebih serius.", ["Multi role", "Workflow konten", "Audit dan keamanan", "Prioritas support"]]
  ]

  return (
    <>
      <PublicNav />
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-card">
              <div>
                <div className="eyebrow">Platform blog modern</div>
                <h1>Bangun blog profesional tanpa ribet.</h1>
                <p>Satu platform untuk menulis artikel, membuat halaman, mengelola dashboard, mengatur SEO, menyambungkan domain, memantau analytics, dan memakai AI tools dalam alur kerja yang nyaman.</p>
                <div className="hero-actions">
                  <a className="btn btn-light" href="/signup">Mulai Gratis</a>
                  <a className="btn btn-dark" href="/dashboard">Buka Dashboard</a>
                </div>
                <div className="hero-points">
                  <span>Editor konten</span>
                  <span>SEO siap pakai</span>
                  <span>Domain custom</span>
                  <span>Dashboard rapi</span>
                  <span>AI tools</span>
                </div>
              </div>

              <div className="product-window">
                <div className="window-top">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <div className="window-body">
                  <span className="badge">Preview dashboard</span>
                  <h3>Selamat datang kembali.</h3>
                  <p>Kelola konten, performa, halaman, media, dan identitas publik dari satu pusat kendali.</p>
                  <div className="metric-grid">
                    <div className="metric"><span>Total post</span><strong>128</strong></div>
                    <div className="metric"><span>Kunjungan</span><strong>8.4K</strong></div>
                    <div className="metric"><span>Dipublikasi</span><strong>42</strong></div>
                    <div className="metric"><span>Draft</span><strong>16</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="produk">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">Fitur utama</div>
                <h2 className="section-title">Semua alat penting dalam satu sistem.</h2>
                <p className="section-copy">Ruang kerja dibuat lega, mudah dibaca, dan siap dikembangkan menjadi platform konten yang lebih besar.</p>
              </div>
              <a className="btn btn-primary" href="/dashboard">Lihat Dashboard</a>
            </div>
            <div className="grid-3">
              {features.map((item, i) => (
                <article className="card" key={item[0]}>
                  <div className="icon">{i + 1}</div>
                  <h3>{item[0]}</h3>
                  <p>{item[1]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta">
              <div className="eyebrow">AI Studio</div>
              <h2>Mulai menulis dengan asisten cerdas.</h2>
              <p>Buat ide, outline, struktur artikel, ringkasan, dan optimasi SEO. Sistem ini disiapkan agar nanti bisa dihubungkan ke API AI pilihanmu.</p>
              <div className="hero-actions">
                <a className="btn btn-light" href="/editor">Buka Editor</a>
                <a className="btn btn-dark" href="/posts">Lihat Post</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="harga">
          <div className="container">
            <div className="kicker">Harga</div>
            <h2 className="section-title">Pilih paket sesuai kebutuhan.</h2>
            <div className="grid-3" style={{ marginTop: 24 }}>
              {prices.map((p, i) => (
                <article className={"price-card " + (i === 1 ? "featured" : "")} key={p[0] as string}>
                  <h3>{p[0]}</h3>
                  <p className="section-copy" style={{ fontSize: 15 }}>{p[2]}</p>
                  <div className="price">{p[1]} <small>/ bulan</small></div>
                  <div className="list">
                    {(p[3] as string[]).map(x => <span key={x}>✓ {x}</span>)}
                  </div>
                  <a className="btn btn-dark" style={{ width: "100%" }} href="/signup">Pilih Paket</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-grid">
        <div>
          <Brand dark />
          <p style={{ marginTop: 18 }}>Platform blog modern untuk konten, halaman, domain, analytics, dan alur kerja digital.</p>
        </div>
        <div>
          <h4>Produk</h4>
          <a href="/dashboard">Dashboard</a>
          <a href="/editor">Editor</a>
          <a href="/pricing">Harga</a>
        </div>
        <div>
          <h4>Platform</h4>
          <a href="/login">Masuk</a>
          <a href="/signup">Daftar</a>
          <a href="/settings">Pengaturan</a>
        </div>
        <div>
          <h4>Keamanan</h4>
          <a href="/security">Security</a>
          <a href="/privacy">Privasi</a>
          <a href="/status">Status</a>
        </div>
      </div>
    </footer>
  )
}

export function AuthPage({ type }: { type: "login" | "signup" }) {
  const isLogin = type === "login"

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Brand />
        <h1>{isLogin ? "Masuk ke dashboard." : "Buat akun baru."}</h1>
        <p>{isLogin ? "Gunakan Google, LinkedIn, atau email admin untuk mengakses ruang kerja." : "Daftar untuk membuat blog, halaman, postingan, dan dashboard pribadi."}</p>
        <div className="form">
          <a className="btn btn-light" href="/dashboard">Masuk dengan Google</a>
          <a className="btn btn-light" href="/dashboard">Masuk dengan LinkedIn</a>
          {!isLogin && <input className="input" placeholder="Nama lengkap" />}
          <input className="input" placeholder="Email admin atau email pengguna" />
          <input className="input" placeholder="Password" type="password" />
          <a className="btn btn-primary" href="/dashboard">{isLogin ? "Masuk dengan Email" : "Buat Akun"}</a>
        </div>
        <p style={{ marginTop: 18 }}>
          {isLogin ? <a href="/signup">Belum punya akun? Daftar sekarang</a> : <a href="/login">Sudah punya akun? Login</a>}
        </p>
        {isLogin && <p><a href="/forgot-password">Lupa password?</a></p>}
      </section>
    </main>
  )
}

export function DashboardShell({
  active,
  eyebrow,
  title,
  description,
  children,
  action
}: {
  active: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  const nav = [
    ["Dashboard Umum", "/dashboard"],
    ["Dashboard Admin", "/admin"],
    ["Profil Utama", "/profile"],
    ["Editor Artikel", "/editor"],
    ["Editor Halaman", "/page-editor"],
    ["Post", "/posts"],
    ["Analytics", "/analytics"],
    ["Settings", "/settings"]
  ]

  return (
    <main className="shell">
      <aside className="sidebar">
        <Brand dark />
        <nav className="side-nav">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className={active === label ? "active" : ""}>{label}</a>
          ))}
        </nav>
      </aside>

      <section className="shell-main">
        <div className="shell-top">
          <div>
            <div className="kicker">{eyebrow}</div>
            <h1 className="shell-title">{title}</h1>
            <p className="section-copy">{description}</p>
          </div>
          {action}
        </div>
        {children}
      </section>
    </main>
  )
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-grid">
      {stats.map(s => (
        <div className="stat" key={s.label}>
          <span>{s.label}</span>
          <strong>{s.value}</strong>
          {s.note && <p>{s.note}</p>}
        </div>
      ))}
    </div>
  )
}

export function Panel({ title, rows }: { title: string; rows: PanelRow[] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="table">
        {rows.map(row => (
          <div className="row" key={row.join("-")}>
            <span>{row[0]}</span>
            <span className="badge">{row[1]}</span>
            <span>{row[2]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
