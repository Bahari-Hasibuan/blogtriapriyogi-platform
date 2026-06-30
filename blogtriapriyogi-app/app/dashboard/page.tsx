import { DashboardShell, Panel, StatGrid } from "../../components/premium-ui"

export default function DashboardPage() {
  return (
    <DashboardShell
      active="Dashboard Umum"
      eyebrow="Dashboard umum"
      title="Kontrol blog dari satu tempat."
      description="Pantau konten, performa, draft, halaman, dan aktivitas kerja tanpa tampilan yang padat."
      action={<a className="btn btn-primary" href="/editor">Buat Artikel</a>}
    >
      <StatGrid stats={[
        { label: "Total artikel", value: "128", note: "Semua konten" },
        { label: "Halaman", value: "42", note: "Landing dan page" },
        { label: "Kunjungan", value: "8.4K", note: "Performa publik" },
        { label: "Draft", value: "16", note: "Belum dipublikasi" },
      ]} />
      <Panel title="Konten terbaru" rows={[
        ["Cara Membuat Blog Premium", "Published", "SEO 94"],
        ["Panduan Domain Custom", "Draft", "SEO 81"],
        ["Strategi Konten Modern", "Published", "SEO 90"],
      ]} />
    </DashboardShell>
  )
}
