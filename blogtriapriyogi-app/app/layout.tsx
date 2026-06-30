import "./globals.css"

export const metadata = {
  title: "TriApriyogi Studio",
  description: "Platform blog modern dengan dashboard, SEO, domain, media, analytics, dan AI tools.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
