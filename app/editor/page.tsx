import { Cards, EditorForm, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="editor"
      title="Article Studio."
      description="Ruang tulis artikel dengan composer, SEO, AI helper, dan draft manager."
    >
      <Panel title="Composer">
        <EditorForm />
      </Panel>
      <Panel title="AI tools">
        <Cards
          items={[
            { title: "Outline", text: "Buat struktur artikel dari topik utama." },
            { title: "Rewrite", text: "Perbaiki kalimat agar lebih jelas." },
            { title: "SEO Meta", text: "Buat meta title dan description." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
