import { defaultTemplate } from "@/components/studio29/templates";

type Props = {
  host: string;
  mode?: "home" | "post";
  postTitle?: string;
};

function cleanBrand(host: string) {
  const base = host.replace(".triapriyogi.com", "");
  if (!base || base === host) return "My Site";
  return base
    .split("-")
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : "")
    .join(" ");
}

export default function PublicSite29({ host, mode = "home", postTitle }: Props) {
  const brand = cleanBrand(host);
  const tpl = defaultTemplate;

  return (
    <main style={{
      minHeight: "100vh",
      background: tpl.palette.bg,
      color: tpl.palette.text,
      fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "26px min(6vw,80px)",
        borderBottom: `1px solid ${tpl.palette.soft}`,
        background: "rgba(255,255,255,.72)",
        position: "sticky",
        top: 0,
        backdropFilter: "blur(18px)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: tpl.palette.primary,
            fontWeight: 900,
          }}>
            {brand.slice(0, 2).toUpperCase()}
          </div>
          <strong>{brand}</strong>
        </div>

        <nav style={{ display: "flex", gap: 20, color: "#64748b", fontSize: 14 }}>
          <span>Home</span>
          <span>Post</span>
          <span>Produk</span>
          <span>Kontak</span>
        </nav>
      </header>

      {mode === "post" ? (
        <article style={{
          width: "min(880px, calc(100% - 36px))",
          margin: "70px auto",
          background: tpl.palette.card,
          borderRadius: 34,
          padding: "44px",
          boxShadow: "0 28px 90px rgba(15,23,42,.10)",
        }}>
          <p style={{
            color: tpl.palette.primary,
            fontWeight: 900,
            letterSpacing: 4,
            fontSize: 12,
            textTransform: "uppercase",
          }}>
            Artikel
          </p>
          <h1 style={{
            fontSize: "clamp(38px,6vw,72px)",
            lineHeight: 1,
            letterSpacing: "-.06em",
            margin: "0 0 22px",
          }}>
            {postTitle || "Preview Artikel"}
          </h1>
          <p style={{ color: "#64748b", lineHeight: 1.9, fontSize: 18 }}>
            Ini adalah tampilan publik artikel di domain user. Nantinya konten dari editor akan tampil di halaman ini.
          </p>
        </article>
      ) : (
        <section style={{
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: 34,
          alignItems: "center",
          width: "min(1180px, calc(100% - 36px))",
          margin: "70px auto",
        }}>
          <div>
            <p style={{
              color: tpl.palette.primary,
              fontWeight: 900,
              letterSpacing: 4,
              fontSize: 12,
              textTransform: "uppercase",
            }}>
              Website aktif
            </p>
            <h1 style={{
              fontSize: "clamp(46px,7vw,92px)",
              lineHeight: .92,
              letterSpacing: "-.075em",
              margin: 0,
            }}>
              {brand} sudah punya ruang publik sendiri.
            </h1>
            <p style={{
              color: "#64748b",
              lineHeight: 1.9,
              fontSize: 18,
              maxWidth: 680,
              marginTop: 24,
            }}>
              Halaman ini tampil dari subdomain user. Template, warna, halaman, dan artikel bisa diatur dari studio.
            </p>
          </div>

          <div style={{
            background: tpl.palette.card,
            borderRadius: 36,
            padding: 28,
            boxShadow: "0 28px 90px rgba(15,23,42,.10)",
          }}>
            <div style={{
              height: 300,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${tpl.palette.primary}, ${tpl.palette.soft})`,
              marginBottom: 22,
            }} />
            <h2 style={{ margin: "0 0 10px", fontSize: 28 }}>Preview template</h2>
            <p style={{ color: "#64748b", lineHeight: 1.7 }}>
              Layout dan warna akan berubah sesuai template yang dipilih user.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
