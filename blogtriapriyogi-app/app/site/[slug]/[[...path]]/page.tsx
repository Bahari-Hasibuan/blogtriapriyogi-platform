import { cookies } from "next/headers";
import { getTemplate, starterSite, SiteState } from "@/components/studio30/studio30Data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function readSite(slug: string): SiteState {
  const raw = cookies().get("studio30_site")?.value;

  if (!raw) {
    return { ...starterSite, slug };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as SiteState;
    return { ...parsed, slug };
  } catch {
    return { ...starterSite, slug };
  }
}

export default function SitePreviewPage({
  params,
}: {
  params: { slug: string; path?: string[] };
}) {
  const site = readSite(params.slug);
  const template = getTemplate(site.templateId);
  const path = params.path || [];
  const isPost = path[0] === "post";
  const postSlug = path[1];
  const post = site.posts.find((item) => item.slug === postSlug);
  const html = isPost && post ? post.bodyHtml : site.pageHtml;

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#0f172a",
      fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
    }}>
      <section style={{
        padding: "28px min(6vw,80px)",
        background: `linear-gradient(135deg, ${template.c1}, ${template.c2})`,
        color: "#fff"
      }}>
        <nav style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          marginBottom: 80
        }}>
          <strong>{site.siteName}</strong>
          <span>{site.slug}.triapriyogi.com</span>
        </nav>

        <div style={{ maxWidth: 900 }}>
          <p style={{ opacity: .8, letterSpacing: 4, textTransform: "uppercase", fontSize: 12 }}>{site.siteType}</p>
          <h1 style={{
            fontSize: "clamp(44px,8vw,96px)",
            lineHeight: .9,
            letterSpacing: "-.075em",
            margin: 0
          }}>
            {isPost && post ? post.title : site.siteName}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 720, opacity: .82 }}>
            Situs publik dari workspace. Halaman ini dibuka dari subdomain user.
          </p>
        </div>
      </section>

      <section style={{
        padding: "42px min(6vw,80px)",
        display: "grid",
        gridTemplateColumns: "1.2fr .8fr",
        gap: 28
      }}>
        <article style={{
          background: "#fff",
          borderRadius: 28,
          padding: 32,
          boxShadow: "0 24px 80px rgba(15,23,42,.08)",
          lineHeight: 1.8
        }}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
          <div dangerouslySetInnerHTML={{ __html: site.themeHtml }} />
        </article>

        <aside style={{
          background: "#fff",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 24px 80px rgba(15,23,42,.08)",
          alignSelf: "start"
        }}>
          <h2>Postingan</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {site.posts.filter((item) => item.status === "Published").map((item) => (
              <a
                key={item.id}
                href={`/post/${item.slug}`}
                style={{
                  display: "block",
                  padding: 16,
                  borderRadius: 18,
                  border: "1px solid #e5e7eb",
                  color: "#0f172a",
                  textDecoration: "none",
                  fontWeight: 750
                }}
              >
                {item.title}
              </a>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
