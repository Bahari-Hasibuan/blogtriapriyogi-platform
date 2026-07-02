import { ActionGrid, Panel, StatCard, StatGrid, StudioShell } from "@/components/studio/StudioShell";

export default function AnalyticsPage() {
  return (
    <StudioShell
      active="analytics"
      eyebrow="Analytics"
      title="Pantau performa konten."
      description="Lihat trafik, konten terbaik, sumber pembaca, durasi baca, dan peluang optimasi."
      ctaLabel="Optimasi SEO"
      ctaHref="/posts"
    >
      <StatGrid>
        <StatCard label="Views" value="8.4K" help="Total kunjungan bulan ini." />
        <StatCard label="CTR" value="6.8%" help="Rasio klik dari pencarian." />
        <StatCard label="Avg Read" value="3m 12s" help="Durasi baca rata-rata." />
        <StatCard label="Growth" value="+18%" help="Pertumbuhan dari bulan lalu." />
      </StatGrid>

      <Panel title="Insight Utama">
        <ActionGrid
          items={[
            { title: "Konten SEO Tinggi", text: "Artikel panduan dan tutorial memberi kontribusi trafik terbesar." },
            { title: "Draft Prioritas", text: "Ada draft dengan peluang SEO tinggi jika diterbitkan." },
            { title: "Halaman Lemah", text: "Beberapa halaman perlu meta description dan internal link." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
