import Link from "next/link"

const modules = [
  ["Content Manager", "/admin/content", "Kelola artikel dan page"],
  ["Media Manager", "/admin/media", "Upload gambar dan file"],
  ["SEO Center", "/admin/seo", "Meta, canonical, schema, sitemap"],
  ["Domain User", "/admin/domains", "Subdomain dan custom domain"],
  ["Analytics", "/admin/analytics", "Page view, visitor, referrer, device"],
  ["Template Builder", "/admin/templates", "Layout, warna, font, blok halaman"],
  ["Payment", "/admin/payment", "Paket, invoice, subscription"],
  ["Admin Role", "/admin/roles", "Owner, admin, editor, writer, viewer"],
]

export default function AdminPage() {
  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>TriSaaS Admin</h1>
      <p>Pusat kendali sistem blog, artikel, page, SEO, domain, analytics, media, template, payment, dan role.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginTop: 24
      }}>
        {modules.map(([title, href, desc]) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              textDecoration: "none",
              color: "#111827",
              background: "#fff"
            }}
          >
            <strong>{title}</strong>
            <p style={{ color: "#6b7280", marginBottom: 0 }}>{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
