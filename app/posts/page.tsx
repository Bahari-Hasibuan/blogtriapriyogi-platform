import { ContentTable, Panel, StatCard, StatGrid, StudioShell } from "@/components/studio/StudioShell";

export default function PostsPage() {
  return (
    <StudioShell
      active="posts"
      eyebrow="Post Manager"
      title="Kelola semua artikel."
      description="Pantau status artikel, draft, SEO score, jadwal publikasi, dan arsip konten."
      ctaLabel="Tulis Artikel"
      ctaHref="/editor"
    >
      <StatGrid>
        <StatCard label="Published" value="96" help="Sudah tampil di publik." />
        <StatCard label="Draft" value="16" help="Masih perlu diedit." />
        <StatCard label="Scheduled" value="7" help="Menunggu jadwal terbit." />
        <StatCard label="Archived" value="9" help="Disimpan sebagai arsip." />
      </StatGrid>

      <Panel title="Daftar Post">
        <ContentTable
          rows={[
            { title: "Panduan Membuat Blog Modern", status: "Published", metric: "SEO 92" },
            { title: "Membangun Brand Personal", status: "Draft", metric: "SEO 76" },
            { title: "Cara Memilih Domain", status: "Scheduled", metric: "SEO 88" },
            { title: "Strategi Newsletter", status: "Published", metric: "SEO 91" },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
