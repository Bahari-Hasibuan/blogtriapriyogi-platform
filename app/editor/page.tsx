import { ActionGrid, EditorBox, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function EditorPage() {
  return (
    <StudioShell
      active="editor"
      eyebrow="Editor Artikel"
      title="Ruang tulis artikel premium."
      description="Buat artikel, susun struktur, atur SEO, simpan draft, dan siapkan publikasi dari satu halaman."
      ctaLabel="Lihat Post"
      ctaHref="/posts"
    >
      <Panel title="Composer">
        <EditorBox />
      </Panel>

      <Panel title="Bantuan AI">
        <ActionGrid
          items={[
            { title: "Outline", text: "Buat struktur artikel dari topik utama." },
            { title: "Rewrite", text: "Perbaiki kalimat agar lebih jelas dan SEO friendly." },
            { title: "Meta SEO", text: "Buat meta title dan meta description." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
