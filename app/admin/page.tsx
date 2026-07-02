import { Cards, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="admin"
      title="Admin Control Center."
      description="Kelola user, role, audit log, keamanan, dan status sistem."
    >
      <Stats />
      <Panel title="Admin modules">
        <Cards items={[
          { title: "Role Management", text: "Atur owner, admin, editor, dan writer." },
          { title: "Audit Log", text: "Pantau perubahan konten dan aktivitas login." },
          { title: "System Health", text: "Cek status domain, API, dan deployment." },
        ]} />
      </Panel>
    </StudioShell>
  );
}
