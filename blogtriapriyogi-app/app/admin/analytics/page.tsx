export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
            TriApriyogi Studio OS
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            Analytics
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Pantau trafik, post populer, perangkat, negara, referrer, dan performa konten.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
          Modul ini sudah aktif. Fitur database, form, aksi, dan integrasi akan ditambahkan tahap berikutnya.
        </div>
      </section>
    </main>
  )
}
