import { DashboardShell, StatGrid, Panel } from "../../components/premium-ui"

export default function AnalyticsPage() {
  return (
    <DashboardShell
      active="Analytics"
      eyebrow="Analytics"
      title="Pantau pertumbuhan konten."
      description="Lihat performa artikel, sumber trafik, engagement, dan halaman yang paling sering dibaca."
    >
      <StatGrid stats={[
        { label: "Visitors", value: "8.4K" },
        { label: "Views", value: "21.7K" },
        { label: "Avg time", value: "3m" },
        { label: "CTR", value: "7.8%" },
      ]} />
      <Panel title="Top content" rows={[
        ["Cara Membuat Blog Premium", "Trending", "3.2K views"],
        ["Panduan SEO Modern", "Growth", "2.4K views"],
        ["Domain Custom", "Stable", "1.1K views"],
      ]} />
    </DashboardShell>
  )
}
