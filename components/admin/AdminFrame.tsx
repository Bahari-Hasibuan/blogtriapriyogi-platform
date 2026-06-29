import Link from "next/link"

const nav = [
  ["Dashboard", "/admin"],
  ["Content", "/admin/content"],
  ["Media", "/admin/media"],
  ["SEO", "/admin/seo"],
  ["Domains", "/admin/domains"],
  ["Analytics", "/admin/analytics"],
  ["Templates", "/admin/templates"],
  ["Payment", "/admin/payment"],
  ["Roles", "/admin/roles"],
]

export default function AdminFrame({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border bg-white p-4 shadow-sm">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">TriSaaS</p>
            <h1 className="text-xl font-bold">Admin OS</h1>
          </div>
          <nav className="grid gap-1">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-slate-950 to-violet-700 p-8 text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-violet-200">Control Center</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">{title}</h2>
            {description ? <p className="mt-4 max-w-3xl text-sm text-violet-100">{description}</p> : null}
          </div>
          {children}
        </section>
      </div>
    </main>
  )
}
