import { PublicNav, Footer } from "../../components/premium-ui"

export default function SecurityPage() {
  return (
    <>
      <PublicNav />
      <main className="section">
        <div className="container panel">
          <div className="kicker">Security</div>
          <h1 className="section-title">Keamanan akun dan konten.</h1>
          <p className="section-copy">Platform disiapkan untuk role akses, autentikasi, audit aktivitas, proteksi admin, dan pengaturan keamanan lanjutan.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
