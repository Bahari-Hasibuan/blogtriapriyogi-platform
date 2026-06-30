import { DashboardShell } from "../../components/premium-ui"

export default function EditorPage() {
  return (
    <DashboardShell
      active="Editor Artikel"
      eyebrow="Editor artikel"
      title="Tulis artikel dengan ruang kerja bersih."
      description="Buat judul, konten, SEO, kategori, excerpt, dan draft publikasi dalam satu layar."
      action={<a className="btn btn-primary" href="/posts">Simpan Draft</a>}
    >
      <div className="editor">
        <section className="panel">
          <input className="input" placeholder="Judul artikel" defaultValue="Judul artikel premium" />
          <br /><br />
          <textarea className="textarea" placeholder="Tulis artikel di sini..." defaultValue={"Mulai tulis artikel dengan struktur rapi.\n\nTambahkan pembuka, poin utama, contoh, kesimpulan, dan optimasi SEO agar konten lebih mudah dibaca."} />
        </section>
        <aside className="panel">
          <h2>AI Assistant</h2>
          <p className="section-copy" style={{ fontSize: 15 }}>Gunakan panel ini untuk ide, outline, rewrite, headline, ringkasan, dan saran SEO.</p>
          <div className="form">
            <button className="btn btn-light">Buat Outline</button>
            <button className="btn btn-light">Optimasi SEO</button>
            <button className="btn btn-light">Rewrite Lebih Natural</button>
            <button className="btn btn-primary">Generate Draft</button>
          </div>
        </aside>
      </div>
    </DashboardShell>
  )
}
