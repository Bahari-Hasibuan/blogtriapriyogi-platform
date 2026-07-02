import { Cards, ContentTable, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="dashboard"
      title="Creator Studio v24 sudah aktif."
      description="Area ini menjadi pusat kontrol artikel, halaman, SEO, analytics, dan workflow publikasi."
    >
      <Stats />
      <Panel title="Konten terbaru">
        <ContentTable />
      </Panel>
      <Panel title="Workflow utama">
        <Cards
          items={[
            { title: "Write", text: "Tulis artikel, simpan draft, dan siapkan publish." },
            { title: "Optimize", text: "Atur slug, meta description, tag, dan SEO score." },
            { title: "Publish", text: "Terbitkan konten dan pantau performanya." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
