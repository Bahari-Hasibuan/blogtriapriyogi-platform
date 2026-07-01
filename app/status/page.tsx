import { PublicNav, Footer } from "../../components/premium-ui"

export default function StatusPage() {
  return (
    <>
      <div></div>
      <main className="section">
        <div className="container panel">
          <div className="kicker">Status</div>
          <h1 className="section-title">Semua sistem berjalan normal.</h1>
          <p className="section-copy">Gunakan halaman ini untuk menampilkan status layanan, domain, database, API, editor, dan AI assistant.</p>
          <div className="grid-3" style={{ marginTop: 24 }}>
            <div className="card"><div className="icon">✓</div><h3>Website</h3><p>Normal</p></div>
            <div className="card"><div className="icon">✓</div><h3>Dashboard</h3><p>Normal</p></div>
            <div className="card"><div className="icon">✓</div><h3>API</h3><p>Siap dikonfigurasi</p></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
