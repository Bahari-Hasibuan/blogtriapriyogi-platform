type SitePageProps = {
  params: {
    subdomain: string;
    slug?: string[];
  };
};

export default function SitePage({ params }: SitePageProps) {
  const path = params.slug?.join("/") || "home";

  return (
    <main style={{
      minHeight: "100vh",
      padding: "48px",
      background: "linear-gradient(135deg, #f8f7ff, #eef8ff)",
      color: "#111827",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <section style={{
        maxWidth: "920px",
        margin: "0 auto",
        background: "white",
        borderRadius: "28px",
        padding: "40px",
        boxShadow: "0 24px 80px rgba(15, 23, 42, 0.12)"
      }}>
        <p style={{
          margin: 0,
          color: "#7c3aed",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase"
        }}>
          User Site
        </p>

        <h1 style={{
          margin: "16px 0 12px",
          fontSize: "44px",
          lineHeight: 1.05
        }}>
          {params.subdomain}.triapriyogi.com
        </h1>

        <p style={{
          margin: 0,
          maxWidth: "640px",
          color: "#6b7280",
          fontSize: "17px",
          lineHeight: 1.7
        }}>
          Ini halaman public untuk user. Nanti konten blog, halaman, domain gratis,
          dan pengaturan publik akan diambil dari CMS studio.
        </p>

        <div style={{
          marginTop: "28px",
          padding: "18px 20px",
          borderRadius: "18px",
          background: "#f5f3ff",
          color: "#4c1d95"
        }}>
          Path aktif: /{path}
        </div>
      </section>
    </main>
  );
}
