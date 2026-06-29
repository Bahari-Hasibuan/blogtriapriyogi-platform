"use client"

import Link from "next/link"
import { useState } from "react"
import styles from "./page.module.css"

const studioUrl =
  process.env.NEXT_PUBLIC_STUDIO_URL || "https://studio.triapriyogi.com"

const loginUrl =
  process.env.NEXT_PUBLIC_LOGIN_URL || "/login"

const features = [
  {
    title: "Editor Canggih",
    text: "Tulis post, page, draft, revisi, jadwal publikasi, dan featured image dalam satu ruang kerja.",
    tag: "Content",
  },
  {
    title: "AI Assistant",
    text: "Bantu ide artikel, outline, rewrite, headline, meta description, dan optimasi konten.",
    tag: "AI",
  },
  {
    title: "SEO Center",
    text: "Kelola meta title, canonical, schema JSON, sitemap, dan struktur konten yang rapi.",
    tag: "SEO",
  },
  {
    title: "Domain Kustom",
    text: "Hubungkan subdomain dan domain pribadi dengan alur verifikasi yang jelas.",
    tag: "Domain",
  },
  {
    title: "Analytics Real-time",
    text: "Pantau page view, visitor, referrer, negara, device, top post, dan performa konten.",
    tag: "Analytics",
  },
  {
    title: "Media Manager",
    text: "Unggah gambar, simpan aset, ambil URL, dan pasang ke artikel dengan cepat.",
    tag: "Media",
  },
]

const modules = [
  "Artikel dan page",
  "Media manager",
  "SEO dan sitemap",
  "Custom domain",
  "Analytics",
  "Template builder",
  "Payment",
  "Admin role",
]

const plans = [
  {
    name: "Free",
    price: "Rp0",
    text: "Untuk mulai membangun blog pribadi.",
    items: ["10 postingan", "Subdomain gratis", "Basic analytics", "Watermark platform"],
  },
  {
    name: "Pro",
    price: "Rp59K",
    text: "Untuk kreator yang ingin tampil profesional.",
    items: ["Postingan lebih banyak", "Custom domain", "AI assistant", "SEO tools"],
    popular: true,
  },
  {
    name: "Bisnis",
    price: "Rp149K",
    text: "Untuk tim, brand, dan bisnis konten.",
    items: ["Multi user", "Role admin", "Prioritas support", "Integrasi API"],
  },
]

const faqs = [
  {
    q: "Apakah bisa pakai domain sendiri?",
    a: "Bisa. Pengguna dapat memakai subdomain gratis atau menghubungkan domain pribadi.",
  },
  {
    q: "Apakah sistem ini untuk banyak user?",
    a: "Bisa. Arsitekturnya dibuat multi-tenant, jadi setiap user punya workspace dan data sendiri.",
  },
  {
    q: "Apakah admin dan user biasa dibedakan?",
    a: "Iya. Akses dibedakan dengan role seperti owner, admin, editor, writer, dan viewer.",
  },
]

export default function HomePage() {
  const [domain, setDomain] = useState("")

  function handleDomainSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanDomain = domain.trim().toLowerCase()

    if (!cleanDomain) {
      window.location.href = loginUrl
      return
    }

    window.location.href = `${loginUrl}?domain=${encodeURIComponent(cleanDomain)}`
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>TA</span>
            <span>
              <strong>TriApriyogi</strong>
              <small>Studio</small>
            </span>
          </Link>

          <div className={styles.navLinks}>
            <a href="#produk">Produk</a>
            <a href="#fitur">Fitur</a>
            <a href="#harga">Harga</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className={styles.navActions}>
            <Link href={loginUrl} className={styles.loginLink}>
              Masuk
            </Link>
            <Link href={loginUrl} className={styles.navButton}>
              Mulai
            </Link>
          </div>
        </nav>

        <form className={styles.domainBar} onSubmit={handleDomainSearch}>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Cari domain atau subdomain blog Anda..."
          />
          <button type="submit">Cari Domain</button>
          <span>Domain kustom untuk pengguna premium</span>
        </form>

        <section className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.badge}>Platform blog modern 2026</div>

            <h1>
              Blog profesional, dashboard pintar, dan AI dalam satu platform.
            </h1>

            <p>
              Bangun blog modern dengan editor artikel, SEO center, media manager,
              domain kustom, analytics, template builder, payment, dan admin role.
            </p>

            <div className={styles.heroActions}>
              <Link href={loginUrl} className={styles.primaryButton}>
                Mulai Gratis
              </Link>
              <a href={studioUrl} className={styles.secondaryButton}>
                Buka Dashboard
              </a>
            </div>

            <div className={styles.trustLine}>
              <span>Gratis selamanya</span>
              <span>Tanpa kartu kredit</span>
              <span>Upgrade kapan saja</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.windowBar}>
              <span />
              <span />
              <span />
              <small>triapriyogi.com/dashboard</small>
            </div>

            <div className={styles.dashboardMock}>
              <aside>
                <strong>TriBlog</strong>
                <small>Dashboard</small>
                <small>Postingan</small>
                <small>Media</small>
                <small>Analytics</small>
                <small>AI Tools</small>
              </aside>

              <section>
                <div className={styles.mockHeader}>
                  <div>
                    <small>Selamat datang</small>
                    <strong>Kelola semuanya.</strong>
                  </div>
                  <span>aktif</span>
                </div>

                <div className={styles.mockStats}>
                  <div>
                    <small>Total post</small>
                    <strong>24</strong>
                  </div>
                  <div>
                    <small>Kunjungan</small>
                    <strong>12.8K</strong>
                  </div>
                  <div>
                    <small>Dipublikasi</small>
                    <strong>18</strong>
                  </div>
                  <div>
                    <small>Draft</small>
                    <strong>6</strong>
                  </div>
                </div>

                <div className={styles.aiPanel}>
                  <b>AI Assistant</b>
                  <span>Generate artikel, rewrite, SEO, image idea.</span>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className={styles.pricingBanner} id="produk">
          <small>Paket dan harga</small>
          <h2>Paket fleksibel untuk semua kreator.</h2>
          <p>Mulai gratis, lalu upgrade saat blog berkembang.</p>
          <strong>Rp0 <span>/ bulan</span></strong>
        </section>

        <section className={styles.aiShowcase}>
          <div>
            <small>AI Blog Writer</small>
            <h2>Tulis artikel lebih cepat dengan bantuan AI.</h2>
            <p>
              Dari ide mentah menjadi outline, draft, judul, meta description,
              dan rekomendasi SEO.
            </p>
            <Link href={loginUrl}>Coba gratis</Link>
          </div>

          <div className={styles.editorMock}>
            <div className={styles.editorTop}>
              <span>Editor post</span>
              <button>Simpan draft</button>
              <button>Publikasi</button>
            </div>
            <h3>Untitled</h3>
            <div className={styles.toolbar}>
              <span>Normal</span>
              <span>HTML</span>
              <span>JSON</span>
              <span>View</span>
              <span>B</span>
              <span>I</span>
              <span>Link</span>
            </div>
            <button className={styles.generateButton}>Generate AI</button>
            <div className={styles.skeleton}>
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className={styles.sectionHead}>
          <small>Build and launch</small>
          <h2>Dari ide hingga online, lebih cepat dan lebih rapi.</h2>
          <p>
            Semua kebutuhan blog disatukan dalam dashboard yang mudah digunakan,
            modern, dan siap dikembangkan.
          </p>
        </section>

        <section className={styles.featureGrid} id="fitur">
          {features.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <span>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.moduleSection}>
          <div>
            <small>Platform modules</small>
            <h2>Satu platform, banyak sistem inti.</h2>
            <p>
              Landing page publik untuk menarik user. Studio untuk kerja harian.
              Admin panel untuk mengatur konten, domain, SEO, payment, dan role.
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {modules.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className={styles.planSection} id="harga">
          <div className={styles.sectionHead}>
            <small>Harga</small>
            <h2>Pilih paket sesuai kebutuhan.</h2>
          </div>

          <div className={styles.planGrid}>
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`${styles.planCard} ${plan.popular ? styles.planPopular : ""}`}
              >
                {plan.popular ? <span className={styles.popular}>Paling populer</span> : null}
                <h3>{plan.name}</h3>
                <p>{plan.text}</p>
                <strong>{plan.price}</strong>
                <small>/ bulan</small>

                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <Link href={loginUrl}>
                  {plan.name === "Bisnis" ? "Hubungi Kami" : `Pilih ${plan.name}`}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.faqSection} id="faq">
          <div>
            <small>FAQ</small>
            <h2>Pertanyaan yang sering diajukan.</h2>
          </div>

          <div className={styles.faqList}>
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <div>
            <h3>TriApriyogi Studio</h3>
            <p>
              Platform blog modern dengan dashboard, AI assistant, analytics,
              custom domain, dan tools publikasi profesional.
            </p>
          </div>

          <div>
            <strong>Produk</strong>
            <Link href={loginUrl}>Dashboard</Link>
            <Link href={loginUrl}>Editor Artikel</Link>
            <a href="#harga">Harga</a>
          </div>

          <div>
            <strong>Perusahaan</strong>
            <a href="#faq">FAQ</a>
            <Link href="/privacy">Privasi</Link>
            <Link href="/terms">Ketentuan</Link>
          </div>

          <div>
            <strong>Platform</strong>
            <Link href={loginUrl}>Masuk</Link>
            <a href={studioUrl}>Studio</a>
            <Link href="/status">Status</Link>
          </div>
        </footer>
      </section>
    </main>
  )
}
