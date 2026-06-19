import { createClient } from "@supabase/supabase-js";
import "../../components/public-site.css";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function cleanHost(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .replace(/\.$/, "");
}

function cleanPath(value: string) {
  const path = decodeURIComponent(String(value || "/"));

  if (!path || path === "/") return "/";

  return path.split("?")[0].replace(/^\/+/, "").replace(/\/+$/, "");
}

function isPostPath(path: string) {
  return path.toLowerCase().endsWith(".html");
}

function cleanSlug(path: string) {
  return path.replace(/\.html$/i, "");
}

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function getVideoEmbedUrl(value: string) {
  const input = String(value || "").trim();

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${encodeURIComponent(match[1])}`;
    }
  }

  if (input.includes("/embed/") && input.startsWith("https://")) {
    return input;
  }

  return "";
}

function parseImageMeta(raw?: string) {
  const meta = {
    size: "large",
    align: "center",
    aspect: "original",
    caption: "",
    link: "",
  };

  const value = String(raw || "").trim();

  if (["medium", "large", "xlarge", "full"].includes(value)) {
    meta.size = value;
    return meta;
  }

  value.split(";").forEach((part) => {
    const [key, ...rest] = part.split("=");
    const cleanKey = key?.trim();
    const cleanValue = rest.join("=").trim();

    if (cleanKey === "size" && ["medium", "large", "xlarge", "full"].includes(cleanValue)) {
      meta.size = cleanValue;
    }

    if (cleanKey === "align" && ["left", "center", "right"].includes(cleanValue)) {
      meta.align = cleanValue;
    }

    if (
      cleanKey === "aspect" &&
      ["original", "landscape", "square", "portrait", "feed", "banner"].includes(cleanValue)
    ) {
      meta.aspect = cleanValue;
    }

    if (cleanKey === "caption") meta.caption = cleanValue;
    if (cleanKey === "link") meta.link = cleanValue;
  });

  return meta;
}

function renderContent(value: string) {
  return String(value || "")
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trim();

      if (line.startsWith("@video ")) {
        const url = line.replace("@video ", "").trim();
        const embedUrl = getVideoEmbedUrl(url);

        if (!embedUrl) return `<p>${escapeHtml(rawLine)}</p>`;

        return `<div class="embed-video"><iframe src="${escapeAttr(embedUrl)}" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
      }

      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/);

      if (imageMatch) {
        const alt = imageMatch[1] || "Gambar";
        const src = imageMatch[2] || "";
        const meta = parseImageMeta(imageMatch[3]);
        const caption = meta.caption || alt;
        const imageHtml = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
        const linkedImage = meta.link
          ? `<a href="${escapeAttr(meta.link)}" target="_blank" rel="noopener noreferrer">${imageHtml}</a>`
          : imageHtml;

        return `<figure class="article-image image-${escapeAttr(meta.size)} align-${escapeAttr(meta.align)} aspect-${escapeAttr(meta.aspect)}">${linkedImage}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
      }

      const escaped = escapeHtml(rawLine);

      if (rawLine.startsWith("### ")) return `<h3>${escapeHtml(rawLine.replace("### ", ""))}</h3>`;
      if (rawLine.startsWith("## ")) return `<h2>${escapeHtml(rawLine.replace("## ", ""))}</h2>`;
      if (rawLine.startsWith("> ")) return `<blockquote>${escapeHtml(rawLine.replace("> ", ""))}</blockquote>`;
      if (rawLine.startsWith("- ")) return `<p>• ${escapeHtml(rawLine.replace("- ", ""))}</p>`;
      if (!rawLine.trim()) return "<br />";
      return `<p>${escaped}</p>`;
    })
    .join("");
}

async function getCustomDomain(host: string) {
  const result = await supabase
    .from("public_site_domains")
    .select("id,user_id,hostname,blog_name,blog_slug,blog_category,site_description,site_theme")
    .eq("hostname", host)
    .single();

  return result.data;
}

async function renderHome(domain: any) {
  const posts = await supabase
    .from("posts")
    .select("title,slug,excerpt,published_at")
    .eq("user_id", domain.user_id)
    .eq("content_type", "post")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(12);

  return (
    <main className={`public-site-page theme-${domain.site_theme || "aurora"}`}>
      <header className="public-top">
        <div className="public-logo">{(domain.blog_name || "TA").slice(0, 2).toUpperCase()}</div>
        <div>
          <b>{domain.blog_name}</b>
          <span>{domain.blog_category}</span>
        </div>
      </header>

      <section className="public-hero">
        <p>{domain.blog_category || "Website"}</p>
        <h1>{domain.blog_name}</h1>
        <span>{domain.site_description || "Selamat datang di website ini."}</span>
      </section>

      <section className="public-posts">
        {(posts.data || []).length === 0 ? (
          <article className="public-card">
            <h2>Belum ada artikel</h2>
            <p>Artikel yang sudah dipublikasikan akan tampil di sini.</p>
          </article>
        ) : (
          (posts.data || []).map((post: any) => (
            <a className="public-card" href={`/${post.slug}.html`} key={post.slug}>
              <h2>{post.title}</h2>
              <p>{post.excerpt || "Baca selengkapnya."}</p>
            </a>
          ))
        )}
      </section>
    </main>
  );
}

async function renderContentPage(domain: any, path: string) {
  const contentType = isPostPath(path) ? "post" : "page";
  const slug = cleanSlug(path);

  const content = await supabase
    .from("posts")
    .select("title,excerpt,content,published_at,seo_title,seo_description,content_type")
    .eq("user_id", domain.user_id)
    .eq("content_type", contentType)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!content.data) {
    return (
      <main className={`public-site-page theme-${domain.site_theme || "aurora"}`}>
        <section className="public-card">
          <h1>{contentType === "page" ? "Halaman tidak ditemukan" : "Artikel tidak ditemukan"}</h1>
          <p>Konten ini belum dipublikasikan atau sudah dipindahkan.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`public-site-page theme-${domain.site_theme || "aurora"}`}>
      <header className="public-top">
        <div className="public-logo">{(domain.blog_name || "TA").slice(0, 2).toUpperCase()}</div>
        <div>
          <b>{domain.blog_name}</b>
          <span>{domain.blog_category}</span>
        </div>
      </header>

      <article className="public-article">
        <a className="public-back" href="/">← Beranda</a>
        <h1>{content.data.title}</h1>
        <p>{content.data.excerpt}</p>

        <div
          className="public-article-body"
          dangerouslySetInnerHTML={{ __html: renderContent(content.data.content || "") }}
        />
      </article>
    </main>
  );
}

export default async function CustomDomainPage(props: any) {
  const searchParams = await props.searchParams;
  const host = cleanHost(searchParams.host || "");
  const path = cleanPath(searchParams.path || "/");

  const domain = await getCustomDomain(host);

  if (!domain) {
    return (
      <main className="public-site-page">
        <section className="public-card">
          <h1>Domain belum aktif</h1>
          <p>Domain ini belum terhubung atau belum selesai diverifikasi.</p>
        </section>
      </main>
    );
  }

  if (path === "/") {
    return renderHome(domain);
  }

  return renderContentPage(domain, path);
}
