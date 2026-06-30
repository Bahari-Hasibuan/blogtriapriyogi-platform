import { DashboardShell, Panel } from "../../components/premium-ui"

export default function PostsPage() {
  return (
    <DashboardShell
      active="Post"
      eyebrow="Post"
      title="Kelola postingan, artikel, dan halaman."
      description="Cari, edit, arsipkan, jadwalkan, dan pantau status konten."
      action={<a className="btn btn-primary" href="/editor">Tambah Post</a>}
    >
      <Panel title="Daftar konten" rows={[
        ["Panduan Blog Profesional", "Published", "Artikel"],
        ["Landing Page Modern", "Draft", "Halaman"],
        ["SEO untuk Kreator", "Scheduled", "Artikel"],
        ["Panduan Domain", "Archived", "Dokumentasi"],
      ]} />
    </DashboardShell>
  )
}
