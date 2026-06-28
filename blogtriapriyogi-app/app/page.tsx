import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ff] text-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between rounded-3xl bg-white/80 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold text-white">
              TA
            </div>
            <div>
              <p className="text-sm font-bold">TriApriyogi</p>
              <p className="text-xs text-slate-500">Studio</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#produk">Produk</a>
            <a href="#fitur">Fitur</a>
            <a href="#harga">Harga</a>
            <a href="#faq">FAQ</a>
          </nav>

          <Link
            href="/login"
            className="rounded-2xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Mulai
          </Link>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-violet-950 to-violet-700 p-8 text-white shadow-xl md:p-12">
            <p className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-medium">
              Platform blog modern
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Blog profesional tanpa ribet.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              Bangun blog modern dengan dashboard, artikel, SEO, domain khusus,
              analitik, dan AI tools dalam satu platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950"
              >
                Mulai Gratis
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-bold text-white"
              >
                Buka Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-white/60">Preview dashboard</p>
              <h2 className="mt-3 text-2xl font-bold">Selamat datang kembali.</h2>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/50">Total post</p>
                  <p className="mt-2 text-3xl font-bold">3</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/50">Kunjungan</p>
                  <p className="mt-2 text-3xl font-bold">12.8K</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/50">Dipublikasi</p>
                  <p className="mt-2 text-3xl font-bold">2</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/50">Draft</p>
                  <p className="mt-2 text-3xl font-bold">1</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Editor Canggih', 'Tulis, edit, dan kelola artikel dari satu ruang kerja.'],
            ['SEO Tools', 'Atur judul, slug, excerpt, dan optimasi konten.'],
            ['Domain Khusus', 'Hubungkan domain pribadi dan subdomain otomatis.'],
            ['AI Assistant', 'Bantu ide artikel, outline, rewrite, dan optimasi.'],
            ['Analytics', 'Pantau performa konten dan pertumbuhan pembaca.'],
            ['Aman', 'Database, auth, dan kontrol akses dibuat terstruktur.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 h-10 w-10 rounded-2xl bg-violet-100" />
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
            </div>
          ))}
        </section>

        <section id="harga" className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-violet-600">Harga</p>
          <h2 className="mt-3 text-4xl font-black">
            Paket fleksibel untuk semua kreator.
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Mulai gratis, lalu upgrade saat blog berkembang.
          </p>
        </section>
      </section>
    </main>
  )
}
