import { Cards, Panel, StudioForm, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="settings"
      title="System Settings v24."
      description="Halaman pengaturan baru untuk domain, SEO, keamanan, identitas situs, dan konfigurasi studio."
    >
      <Panel title="Konfigurasi platform">
        <StudioForm />
      </Panel>

      <Panel title="Modul sistem">
        <Cards
          items={[
            {
              title: "Domain Routing",
              text: "triapriyogi.com untuk halaman publik dan studio.triapriyogi.com untuk dashboard.",
            },
            {
              title: "SEO Defaults",
              text: "Atur title, description, sitemap, robots, dan canonical.",
            },
            {
              title: "Security",
              text: "Siapkan role, login, session, dan proteksi admin.",
            },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
