import "./globals.css";

export const metadata = {
  title: "TriApriyogi Studio",
  description:
    "Platform blog modern dengan dashboard, AI Assistant, analytics, dan domain kustom.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
