import { ActionGrid, Panel, StatCard, StatGrid, StudioShell } from "@/components/studio/StudioShell";

export default function ProfilePage() {
  return (
    <StudioShell
      active="profile"
      eyebrow="Profil Utama"
      title="Profil studio dan pemilik."
      description="Kelola identitas admin, bio singkat, sosial media, dan tampilan profil publik."
      ctaLabel="Edit Profil"
      ctaHref="/profile"
    >
      <StatGrid>
        <StatCard label="Brand" value="TA" help="Identitas visual utama." />
        <StatCard label="Role" value="Owner" help="Akses penuh studio." />
        <StatCard label="Status" value="Active" help="Profil aktif." />
        <StatCard label="Security" value="Good" help="Konfigurasi dasar aman." />
      </StatGrid>

      <Panel title="Profil Publik">
        <ActionGrid
          items={[
            { title: "Bio", text: "Tulis deskripsi singkat yang tampil di halaman publik." },
            { title: "Social Links", text: "Hubungkan Instagram, LinkedIn, GitHub, dan kontak." },
            { title: "Brand Kit", text: "Atur warna, logo, dan gaya visual platform." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
