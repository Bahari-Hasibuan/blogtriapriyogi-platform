import { ContentTable, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="posts"
      title="Content Library."
      description="Kelola artikel, draft, scheduled post, arsip, kategori, dan tag."
    >
      <Stats />
      <Panel title="Daftar konten">
        <ContentTable />
      </Panel>
    </StudioShell>
  );
}
