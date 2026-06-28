import Link from "next/link"
import { notFound } from "next/navigation"
import { adminModules } from "../../../components/admin/modules"

export function generateStaticParams() {
  return adminModules.map((item) => ({
    module: item.slug
  }))
}

export default function AdminModulePage({
  params
}: {
  params: { module: string }
}) {
  const item = adminModules.find((module) => module.slug === params.module)

  if (!item) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 md:px-10">
      <section className="mx-auto max-w-5xl">
        <Link href="/admin" className="mb-6 inline-flex text-sm font-semibold text-violet-700">
          ← Kembali ke Admin Panel
        </Link>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            {item.status}
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            {item.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {item.subtitle}
          </p>

          <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white">
            <h2 className="text-xl font-bold">Status pengembangan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Modul ini sudah masuk struktur sistem. Tahap berikutnya adalah menghubungkan fitur ini ke database, autentikasi, API, dan UI produksi.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
