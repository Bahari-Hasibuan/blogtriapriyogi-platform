import { DashboardShell } from "../../components/premium-ui"

export default function SettingsPage() {
  return (
    <DashboardShell
      active="Settings"
      eyebrow="Settings"
      title="Pengaturan platform."
      description="Atur identitas, domain, role, email admin, notifikasi, keamanan, dan koneksi layanan."
    >
      <section className="panel">
        <h2>Konfigurasi utama</h2>
        <div className="form">
          <input className="input" placeholder="Email owner" />
          <input className="input" placeholder="Domain utama" />
          <select className="input" defaultValue="premium">
            <option value="premium">Tema Premium Light</option>
            <option value="dark">Tema Premium Dark</option>
            <option value="clean">Tema Clean Editorial</option>
          </select>
          <a className="btn btn-primary" href="/dashboard">Simpan Pengaturan</a>
        </div>
      </section>
    </DashboardShell>
  )
}
