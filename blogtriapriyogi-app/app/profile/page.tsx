import { DashboardShell } from "../../components/premium-ui"

export default function ProfilePage() {
  return (
    <DashboardShell
      active="Profil Utama"
      eyebrow="Profil utama"
      title="Identitas brand dan ruang publik."
      description="Atur nama studio, alamat publik, deskripsi, warna, tampilan, dan informasi profil."
    >
      <section className="panel">
        <h2>Profil brand</h2>
        <div className="form">
          <input className="input" placeholder="Nama brand" defaultValue="Tri Apri Yogi Studio" />
          <input className="input" placeholder="Alamat publik" defaultValue="triapriyogi.com" />
          <textarea className="textarea" style={{ minHeight: 160 }} defaultValue="Studio konten modern untuk artikel, halaman, domain, analytics, dan publikasi profesional." />
          <a className="btn btn-primary" href="/dashboard">Simpan Profil</a>
        </div>
      </section>
    </DashboardShell>
  )
}
