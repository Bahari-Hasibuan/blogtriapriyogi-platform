import Link from "next/link"
import type { AdminModule } from "./modules"

export function AdminCard({ item }: { item: AdminModule }) {
  return (
    <Link
      href={`/admin/${item.slug}`}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          {item.status}
        </span>
        <span className="text-slate-400 transition group-hover:translate-x-1">→</span>
      </div>

      <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-950">
        {item.title}
      </h2>

      <p className="text-sm leading-6 text-slate-600">
        {item.subtitle}
      </p>
    </Link>
  )
}
