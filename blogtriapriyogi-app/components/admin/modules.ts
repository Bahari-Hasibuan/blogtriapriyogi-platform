export type AdminModule = {
  slug: string
  title: string
  subtitle: string
  status: string
}

export const adminModules: AdminModule[] = [
  {
    slug: "editor",
    title: "Editor Artikel",
    subtitle: "Tulis, simpan draft, publikasi, jadwal, dan revisi artikel.",
    status: "Core"
  },
  {
    slug: "ai-tools",
    title: "AI Tools",
    subtitle: "Generate artikel, rewrite, SEO title, outline, meta description, dan ide konten.",
    status: "AI"
  },
  {
    slug: "seo",
    title: "SEO Center",
    subtitle: "Kelola meta tag, sitemap, schema, keyword, indexing, dan audit konten.",
    status: "Growth"
  },
  {
    slug: "domains",
    title: "Domain User",
    subtitle: "Kelola subdomain, custom domain, DNS verification, dan status domain.",
    status: "Infra"
  },
  {
    slug: "analytics",
    title: "Analytics",
    subtitle: "Pantau trafik, post populer, referrer, negara, perangkat, dan performa.",
    status: "Data"
  },
  {
    slug: "media",
    title: "Media Manager",
    subtitle: "Upload, kelola gambar, file, aset blog, dan optimasi media.",
    status: "Asset"
  },
  {
    slug: "templates",
    title: "Template Builder",
    subtitle: "Atur tema, layout, warna, font, blok halaman, dan desain situs.",
    status: "Design"
  },
  {
    slug: "payments",
    title: "Payment",
    subtitle: "Kelola paket gratis, pro, bisnis, invoice, subscription, dan pembayaran.",
    status: "Billing"
  },
  {
    slug: "users",
    title: "Admin Panel",
    subtitle: "Kelola pengguna, role, akses, keamanan, dan audit aktivitas.",
    status: "Admin"
  }
]
