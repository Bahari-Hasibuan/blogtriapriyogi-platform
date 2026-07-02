import { Cards, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="settings"
      title="System Settings v24."
      description="Halaman ini sudah diganti total. Tidak ada lagi form lama Tema Premium Light."
    >
      <Panel title="Konfigurasi platform">
        <div className="studio-form">
          <input placeholder="Nama situs" />
          <input placeholder="Domain utama" />
          <input placeholder="Subdomain studio" />
          <select>
            <option>Studio Purple Cloud</option>
            <option>Studio Dark Pro</option>
            <option>Studio Clean White</option>
          </select>
          <button>Simpan Konfigurasi</button>
        </div>
      </Panel>
      <Panel title="Modul sistem">
        <Cards items={[
          { title: "Domain Routing", text: "triapriyogi.com untuk publik dan studio.triapriyogi.com untuk dashboard." },
          { title: "SEO Defaults", text: "Atur title, description, sitemap, robots, dan canonical." },
          { title: "Security", text: "Siapkan role, login, session, dan proteksi admin." },
        ]} />
      </Panel>
    </StudioShell>
  );
}
