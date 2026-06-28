import { AdminCard } from "../../components/admin/AdminCard"
import { adminModules } from "../../components/admin/modules"

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 md:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-slate-950 via-violet-950 to-violet-700 p-8 text-white shadow-xl md:p-12">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-100">
            TriApriyogi Studio OS
          </p>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Pusat kendali blog, AI, SEO, domain, analytics, media, template, payment, dan admin.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100">
            Ini fondasi dashboard utama. Setelah ini setiap modul akan dibuat menjadi sistem penuh yang terhubung ke database, autentikasi, dan produksi Vercel.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {adminModules.map((item) => (
            <AdminCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
    </main>
  )
}
