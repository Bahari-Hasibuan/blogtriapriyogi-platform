export default function Navbar() {
  return (
    <header className="navbar">
      <a className="brand" href="#">
        <div className="brandMark">TA</div>
        <div>
          <strong>TriApriyogi</strong>
          <span>STUDIO</span>
        </div>
      </a>

      <nav className="navLinks">
        <a href="#features">Fitur</a>
        <a href="#ai">AI Studio</a>
        <a href="#pricing">Harga</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div className="navActions">
        <a className="ghostButton" href="/login">Masuk</a>
        <a className="solidButton small" href="#pricing">Mulai</a>
      </div>
    </header>
  );
}
