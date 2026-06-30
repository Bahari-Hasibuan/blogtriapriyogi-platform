import { PublicNav, Footer } from "../../components/premium-ui"

export default function PrivacyPage() {
  return (
    <>
      <PublicNav />
      <main className="section">
        <div className="container panel">
          <div className="kicker">Privasi</div>
          <h1 className="section-title">Data pengguna harus aman dan jelas.</h1>
          <p className="section-copy">Halaman ini disiapkan untuk menjelaskan pengelolaan data, akses akun, keamanan email, dan kontrol pengguna.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
