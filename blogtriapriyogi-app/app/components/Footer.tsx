export default function Footer() {
  return (
    <footer style={{
      padding: 60,
      textAlign: "center",
      borderTop: "1px solid #eee",
      background: "linear-gradient(to right, #0f0f1a, #1b1b2e)",
      color: "#fff"
    }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>
        Triapriyogi Platform
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        © Triapriyogi. All rights reserved.
      </div>
    </footer>
  )
}
