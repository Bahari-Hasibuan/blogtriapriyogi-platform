import { DashboardShell } from "../../components/premium-ui"

export default function PageEditorPage() {
  return (
    <DashboardShell
      active="Editor Halaman"
      eyebrow="Editor halaman"
      title="Bangun halaman publik yang rapi."
      description="Susun halaman profil, layanan, harga, kontak, dan dokumentasi dengan blok konten."
    >
      <section className="panel">
        <h2>Page Builder</h2>
        <div className="grid-2">
          <div className="card"><div className="icon">H</div><h3>Hero Section</h3><p>Judul besar, deskripsi, tombol aksi, dan visual utama.</p></div>
          <div className="card"><div className="icon">F</div><h3>Feature Grid</h3><p>Daftar fitur dengan ikon, teks pendek, dan layout nyaman.</p></div>
          <div className="card"><div className="icon">P</div><h3>Pricing</h3><p>Paket gratis, pro, dan bisnis dengan detail manfaat.</p></div>
          <div className="card"><div className="icon">Q</div><h3>FAQ</h3><p>Pertanyaan umum untuk membantu calon pengguna.</p></div>
        </div>
      </section>
    </DashboardShell>
  )
}
