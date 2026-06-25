export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Produk", href: "/pricing" },
    { label: "Dokumentasi", href: "/docs" },
    { label: "Keamanan", href: "/security" },
    { label: "Kontak", href: "/contact" }
  ];

  const social = [
    { label: "GitHub", href: "https://github.com" },
    { label: "Email", href: "mailto:hello@triapriyogi.com" }
  ];

  return (
    <footer style={{
      marginTop: 80,
      padding: 40,
      borderTop: "1px solid #eee",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      textAlign: "center"
    }}>
      
      <div>
        <h3 style={{ margin: 0 }}>TriApriyogi Studio</h3>
        <p style={{ margin: 0, opacity: 0.7 }}>
          Build, publish, and scale content in one system
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        {links.map((item) => (
          <a key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            {item.label}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 15, flexWrap: "wrap", opacity: 0.8 }}>
        {social.map((item) => (
          <a key={item.href} href={item.href} target="_blank">
            {item.label}
          </a>
        ))}
      </div>

      <div style={{ fontSize: 12, opacity: 0.6 }}>
        © {year} TriApriyogi Studio. All rights reserved.
      </div>

    </footer>
  );
}
