export const dynamic = "force-dynamic"

export default function AdminPage() {
  const modules = [
    "Editor Artikel",
    "AI Tools",
    "SEO Center",
    "Domain User",
    "Analytics",
    "Media Manager",
    "Template Builder",
    "Payment",
    "Admin Panel"
  ]

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[32px] bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-950 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-200">
            TriApriyogi Studio OS
          </p>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Dashboard utama berhasil aktif.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100">
            Sistem besar siap dikembangkan bertahap: editor artikel, AI tools, SEO, domain user, analytics, media manager, template builder, payment, dan admin panel.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {modules.map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h2 className="text-xl font-bold">{item}</h2>
              <p className="mt-2 text-sm text-slate-300">
                Modul sudah masuk struktur sistem.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
