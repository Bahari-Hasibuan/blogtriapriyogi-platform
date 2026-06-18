import { createClient } from "@supabase/supabase-js";
import "../../../components/public-site.css";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function cleanSlug(value: string) {
  return decodeURIComponent(value || "").replace(/\.html$/i, "");
}

function isPostUrl(value: string) {
  return decodeURIComponent(value || "").toLowerCase().endsWith(".html");
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

  if (value === "medium" || value === "large" || value === "xlarge" || value === "full") {
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

        return `<div class="embed-video"><iframe src="${escapeAttr(embedUrl)}" title="Video halaman" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
      }

      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/);

      if (imageMatch) {
        const alt = imageMatch[1] || "Gambar halaman";
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

export async function generateMetadata(props: any) {
  const params = await props.params;
  const site = params.site;
  const rawSlug = params.article;
  const slug = cleanSlug(rawSlug);
  const contentType = isPostUrl(rawSlug) ? "post" : "page";

  const profile = await supabase
    .from("public_profiles")
    .select("id,blog_name")
    .eq("blog_slug", site)
    .single();

  if (!profile.data) {
    return { title: "Halaman tidak ditemukan" };
  }

  const content = await supabase
    .from("posts")
    .select("title,seo_title,seo_description,excerpt")
    .eq("user_id", profile.data.id)
    .eq("content_type", contentType)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return {
    title: content.data?.seo_title || content.data?.title || profile.data.blog_name,
    description: content.data?.seo_description || content.data?.excerpt || "",
  };
}

export default async function PublicContentPage(props: any) {
  const params = await props.params;
  const site = params.site;
  const rawSlug = params.article;
  const slug = cleanSlug(rawSlug);
  const contentType = isPostUrl(rawSlug) ? "post" : "page";

  const profile = await supabase
    .from("public_profiles")
    .select("id,blog_name,blog_slug,blog_category,site_description,site_theme")
    .eq("blog_slug", site)
    .single();

  if (!profile.data) {
    return (
      <main className="public-site-page">
        <section className="public-card">
          <h1>Situs tidak ditemukan</h1>
          <p>Alamat publik ini belum tersedia.</p>
        </section>
      </main>
    );
  }

  const content = await supabase
    .from("posts")
    .select("title,excerpt,content,published_at,seo_title,seo_description,content_type")
    .eq("user_id", profile.data.id)
    .eq("content_type", contentType)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!content.data) {
    return (
      <main className={`public-site-page theme-${profile.data.site_theme || "aurora"}`}>
        <section className="public-card">
          <h1>{contentType === "page" ? "Halaman tidak ditemukan" : "Artikel tidak ditemukan"}</h1>
          <p>Konten ini belum dipublikasikan atau sudah dipindahkan.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`public-site-page theme-${profile.data.site_theme || "aurora"}`}>
      <header className="public-top">
        <div className="public-logo">
          {(profile.data.blog_name || "TA").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <b>{profile.data.blog_name}</b>
          <span>{profile.data.blog_category}</span>
        </div>
      </header>

      <article className="public-article">
        <a className="public-back" href={`https://${profile.data.blog_slug}.triapriyogi.com`}>
          ← Beranda
        </a>

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
