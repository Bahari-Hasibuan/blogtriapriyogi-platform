import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/assets/favicon/default/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
