import { ActionGrid, Panel, StatCard, StatGrid, StudioShell } from "@/components/studio/StudioShell";

export default function AdminPage() {
  return (
    <StudioShell
      active="admin"
      eyebrow="Dashboard Admin"
      title="Kelola sistem, user, dan akses."
      description="Area admin untuk role, keamanan, status sistem, audit log, dan konfigurasi inti CMS."
      ctaLabel="Buka Settings"
      ctaHref="/settings"
    >
      <StatGrid>
        <StatCard label="Admin" value="3" help="Akun dengan akses penuh." />
        <StatCard label="Editor" value="8" help="Akun pengelola konten." />
        <StatCard label="Keamanan" value="98%" help="Konfigurasi dasar aman." />
        <StatCard label="API Aktif" value="12" help="Endpoint CMS tersedia." />
      </StatGrid>

      <Panel title="Modul Admin">
        <ActionGrid
          items={[
            { title: "Role Management", text: "Atur admin, editor, penulis, dan pembaca." },
            { title: "Audit Log", text: "Pantau perubahan konten dan aktivitas sistem." },
            { title: "System Health", text: "Cek status domain, build, API, dan penyimpanan." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
