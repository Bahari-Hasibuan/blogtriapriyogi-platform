export default function Navbar() {
  return (
    <header className="navbar">
      <a className="brand" href="/">
        <div className="brandMark">TA</div>
        <div>
          <strong>TriApriyogi</strong>
          <span>STUDIO</span>
        </div>
      </a>

      <nav className="navLinks">
        <a href="#features">Produk</a>
        <a href="/pricing">Harga</a>
        <a href="/docs">Dokumentasi</a>
        <a href="/security">Security</a>
        <a href="/about">Perusahaan</a>
        <a href="/contact">Kontak</a>
      </nav>

      <div className="navActions">
        <a className="ghostButton" href="/login">Masuk</a>
        <a className="solidButton small" href="/dashboard">Dashboard</a>
      </div>
    </header>
  );
}
