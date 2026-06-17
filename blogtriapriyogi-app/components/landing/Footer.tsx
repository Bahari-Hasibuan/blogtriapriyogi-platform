export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <h3>TriApriyogi Studio</h3>
        <p>
          Platform blog modern dengan dashboard, AI Assistant, analytics,
          custom domain, dan tools publikasi profesional.
        </p>
      </div>

      <div>
        <b>Produk</b>
        <a href="/dashboard">Dashboard</a>
        <a href="/editor">Editor Artikel</a>
        <a href="/pricing">Harga</a>
        <a href="/docs">Dokumentasi</a>
      </div>

      <div>
        <b>Perusahaan</b>
        <a href="/about">Tentang</a>
        <a href="/contact">Kontak</a>
        <a href="/security">Keamanan</a>
        <a href="/status">Status</a>
      </div>

      <div>
        <b>Platform</b>
        <a href="/login">Masuk</a>
        <a href="/settings">Pengaturan</a>
        <a href="/docs">Panduan</a>
        <a href="/security">Privasi</a>
      </div>
    </footer>
  );
}
