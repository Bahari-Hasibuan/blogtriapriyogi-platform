import { ActionGrid, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function PageEditorPage() {
  return (
    <StudioShell
      active="page-editor"
      eyebrow="Editor Halaman"
      title="Bangun halaman tanpa ribet."
      description="Kelola landing page, halaman profil, pricing, policy, dan halaman campaign."
      ctaLabel="Buat Halaman"
      ctaHref="/page-editor"
    >
      <Panel title="Page Blocks">
        <ActionGrid
          items={[
            { title: "Hero Section", text: "Judul besar, deskripsi, CTA, dan visual utama." },
            { title: "Feature Grid", text: "Tampilkan fitur utama dengan kartu yang rapi." },
            { title: "CTA Section", text: "Arahkan pengunjung ke login, dashboard, atau pricing." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
