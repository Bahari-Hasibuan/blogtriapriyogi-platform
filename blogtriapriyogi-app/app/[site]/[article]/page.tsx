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
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderContent(value: string) {
  const escaped = escapeHtml(value || "");
  return escaped
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.replace("### ", "")}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.replace("## ", "")}</h2>`;
      if (line.startsWith("> ")) return `<blockquote>${line.replace("> ", "")}</blockquote>`;
      if (line.startsWith("- ")) return `<p>• ${line.replace("- ", "")}</p>`;
      if (!line.trim()) return "<br />";
      return `<p>${line}</p>`;
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
