import { DashboardShell, Panel, StatGrid } from "../../components/premium-ui"

export default function AdminPage() {
  return (
    <DashboardShell
      active="Dashboard Admin"
      eyebrow="Admin"
      title="Kelola user, akses, konten, dan sistem."
      description="Ruang kendali untuk owner, admin, editor, penulis, pembayaran, domain, keamanan, dan pengaturan platform."
      action={<a className="btn btn-primary" href="/settings">Tambah User</a>}
    >
      <StatGrid stats={[
        { label: "Admin aktif", value: "1", note: "Owner utama" },
        { label: "Mode platform", value: "Ready", note: "Siap dikembangkan" },
        { label: "Role aktif", value: "4", note: "Owner, admin, editor, user" },
        { label: "Security", value: "On", note: "Proteksi dasar" },
      ]} />
      <Panel title="Kontrol akses" rows={[
        ["Owner", "Full Access", "System"],
        ["Admin", "Manage Content", "Platform"],
        ["Editor", "Create and Publish", "Content"],
        ["User", "Read and Write", "Workspace"],
      ]} />
    </DashboardShell>
  )
}
