import { Cards, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="profile"
      title="Brand Profile."
      description="Kelola profil pemilik, bio publik, link sosial, dan brand kit."
    >
      <Stats />
      <Panel title="Brand kit">
        <Cards items={[
          { title: "Bio", text: "Deskripsi singkat untuk halaman publik." },
          { title: "Social Links", text: "Hubungkan Instagram, LinkedIn, GitHub, dan kontak." },
          { title: "Visual Identity", text: "Atur logo, warna, dan tampilan brand." },
        ]} />
      </Panel>
    </StudioShell>
  );
}
