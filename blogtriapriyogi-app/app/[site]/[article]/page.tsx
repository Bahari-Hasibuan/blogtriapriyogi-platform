import { createClient } from "@supabase/supabase-js";
import "../../../components/public-site.css";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function cleanArticleSlug(value: string) {
  return decodeURIComponent(value || "").replace(/\.html$/i, "");
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

function getYouTubeId(value: string) {
  const input = String(value || "").trim();

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

function renderContent(value: string) {
  return String(value || "")
    .split("
")
    .map((rawLine) => {
      const line = rawLine.trim();

      if (line.startsWith("@youtube ")) {
        const url = line.replace("@youtube ", "").trim();
        const id = getYouTubeId(url);

        if (!id) {
          return `<p>${escapeHtml(rawLine)}</p>`;
        }

        return `<div class="embed-video"><iframe src="https://www.youtube.com/embed/${escapeAttr(id)}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
      }

      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)(?:\{(medium|large|xlarge)\})?$/);

      if (imageMatch) {
        const alt = imageMatch[1] || "Gambar artikel";
        const src = imageMatch[2] || "";
        const size = imageMatch[3] || "large";

        return `<figure class="article-image image-${escapeAttr(size)}"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
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
  const articleSlug = cleanArticleSlug(params.article);

  const profile = await supabase
    .from("public_profiles")
    .select("id,blog_name")
    .eq("blog_slug", site)
    .single();

  if (!profile.data) {
    return { title: "Artikel tidak ditemukan" };
  }

  const post = await supabase
    .from("posts")
    .select("title,seo_title,seo_description,excerpt")
    .eq("user_id", profile.data.id)
    .eq("slug", articleSlug)
    .eq("status", "published")
    .single();

  return {
    title: post.data?.seo_title || post.data?.title || profile.data.blog_name,
    description: post.data?.seo_description || post.data?.excerpt || "",
  };
}

export default async function PublicArticlePage(props: any) {
  const params = await props.params;
  const site = params.site;
  const articleSlug = cleanArticleSlug(params.article);

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

  const post = await supabase
    .from("posts")
    .select("title,excerpt,content,published_at,seo_title,seo_description")
    .eq("user_id", profile.data.id)
    .eq("slug", articleSlug)
    .eq("status", "published")
    .single();

  if (!post.data) {
    return (
      <main className={`public-site-page theme-${profile.data.site_theme || "aurora"}`}>
        <section className="public-card">
          <h1>Artikel tidak ditemukan</h1>
          <p>Artikel ini belum dipublikasikan atau sudah dipindahkan.</p>
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

        <h1>{post.data.title}</h1>
        <p>{post.data.excerpt}</p>

        <div
          className="public-article-body"
          dangerouslySetInnerHTML={{ __html: renderContent(post.data.content || "") }}
        />
      </article>
    </main>
  );
}
