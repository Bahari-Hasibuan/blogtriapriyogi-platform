import { ActionGrid, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function SettingsPage() {
  return (
    <StudioShell
      active="settings"
      eyebrow="Settings"
      title="Atur identitas platform."
      description="Kelola nama situs, domain, SEO default, keamanan, dan konfigurasi CMS."
      ctaLabel="Cek Dashboard"
      ctaHref="/dashboard"
    >
      <Panel title="Konfigurasi Utama">
        <ActionGrid
          items={[
            { title: "Site Identity", text: "Nama situs, deskripsi, logo, dan warna utama." },
            { title: "Domain Routing", text: "Pisahkan domain utama dan subdomain studio." },
            { title: "SEO Default", text: "Atur fallback title, description, sitemap, dan robots." },
            { title: "Security", text: "Siapkan role, sesi login, dan proteksi dashboard." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
