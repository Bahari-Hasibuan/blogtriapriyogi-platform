import "../app/globals.css"
import Sidebar from "../components/sidebar/sidebar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
