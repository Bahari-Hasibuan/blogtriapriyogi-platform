import {
  ActionGrid,
  ContentTable,
  Panel,
  StatCard,
  StatGrid,
  StudioShell,
} from "@/components/studio/StudioShell";

export default function DashboardPage() {
  return (
    <StudioShell
      active="dashboard"
      eyebrow="Dashboard Umum"
      title="Kontrol studio dari satu pusat."
      description="Dashboard ini dipakai untuk memantau artikel, halaman, draft, performa, dan aktivitas kerja utama."
      ctaLabel="Buat Artikel"
      ctaHref="/editor"
    >
      <StatGrid>
        <StatCard label="Total Artikel" value="128" help="Semua artikel aktif, draft, dan arsip." />
        <StatCard label="Halaman" value="42" help="Landing page, policy, profil, dan campaign." />
        <StatCard label="Kunjungan" value="8.4K" help="Performa publik bulan ini." />
        <StatCard label="Draft" value="16" help="Konten belum dipublikasi." />
      </StatGrid>

      <Panel title="Konten Terbaru">
        <ContentTable
          rows={[
            { title: "Cara Membuat Blog Premium", status: "Published", metric: "SEO 94" },
            { title: "Panduan Domain Custom", status: "Draft", metric: "SEO 81" },
            { title: "Strategi Konten Modern", status: "Published", metric: "SEO 90" },
          ]}
        />
      </Panel>

      <Panel title="Pusat Kerja Cepat">
        <ActionGrid
          items={[
            { title: "Editor Artikel", text: "Tulis, edit, simpan draft, dan siapkan publikasi." },
            { title: "SEO Tools", text: "Atur title, slug, excerpt, tag, dan meta description." },
            { title: "Analytics", text: "Lihat performa halaman dan prioritas optimasi konten." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
