export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>
        {children}

        <footer style={{
          padding: 40,
          textAlign: "center",
          borderTop: "1px solid #eee"
        }}>
          BlogTriapriyogi Platform
        </footer>
      </body>
    </html>
  )
}
