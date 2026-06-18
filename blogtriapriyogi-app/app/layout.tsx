import "../components/auth.css";
import "./globals.css";

export const metadata = {
  title: "TriApriyogi Studio",
  description:
    "Platform blog modern dengan dashboard, AI Assistant, analytics, dan domain kustom.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
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
