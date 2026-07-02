import { Cards, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="page-editor"
      title="Page Builder."
      description="Bangun landing page, pricing, profil, policy, dan campaign page."
    >
      <Panel title="Page blocks">
        <Cards items={[
          { title: "Hero", text: "Judul besar, CTA, dan visual utama." },
          { title: "Features", text: "Kartu fitur dengan struktur rapi." },
          { title: "CTA", text: "Arahkan pengunjung ke login atau dashboard." },
        ]} />
      </Panel>
    </StudioShell>
  );
}
