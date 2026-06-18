import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    site: string;
    article: string;
  }>;
};

type PublicProfile = {
  id: string;
  blog_name: string;
  blog_slug: string;
  blog_category: string | null;
  site_description: string | null;
};

type PublicPost = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  created_at: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function cleanArticleSlug(value: string) {
  return value.replace(/\.html$/i, "");
}

async function fetchPublicProfile(slug: string): Promise<PublicProfile | null> {
  if (!supabaseUrl || !anonKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/public_profiles?blog_slug=eq.${encodeURIComponent(
      slug
    )}&select=id,blog_name,blog_slug,blog_category,site_description`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as PublicProfile[];
  return data[0] || null;
}

async function fetchPost(userId: string, slug: string): Promise<PublicPost | null> {
  if (!supabaseUrl || !anonKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/posts?user_id=eq.${encodeURIComponent(
      userId
    )}&slug=eq.${encodeURIComponent(
      slug
    )}&status=eq.published&select=id,title,slug,excerpt,content,created_at&limit=1`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as PublicPost[];
  return data[0] || null;
}

export async function generateMetadata({ params }: PageProps) {
  const { site, article } = await params;
  const profile = await fetchPublicProfile(site);

  if (!profile) {
    return {
      title: "Artikel tidak ditemukan",
    };
  }

  const slug = cleanArticleSlug(article);
  const post = await fetchPost(profile.id, slug);

  if (!post) {
    return {
      title: "Artikel tidak ditemukan",
    };
  }

  return {
    title: `${post.title} | ${profile.blog_name}`,
    description:
      post.excerpt ||
      profile.site_description ||
      `${post.title} dari ${profile.blog_name}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || profile.site_description || "",
      type: "article",
    },
  };
}

export default async function PublicArticlePage({ params }: PageProps) {
  const { site, article } = await params;
  const profile = await fetchPublicProfile(site);

  if (!profile) notFound();

  const articleSlug = cleanArticleSlug(article);
  const post = await fetchPost(profile.id, articleSlug);

  if (!post) notFound();

  const lines = (post.content || "").split("\n");

  return (
    <main className="public-site-page">
      <section className="public-hero article">
        <div className="public-brand">
          <span>{profile.blog_name.slice(0, 2).toUpperCase()}</span>
          <div>
            <b>{profile.blog_name}</b>
            <small>{profile.blog_category || "Platform Digital"}</small>
          </div>
        </div>

        <Link href={`https://${profile.blog_slug}.triapriyogi.com`} className="public-back">
          ← Kembali ke beranda
        </Link>

        <div className="public-hero-content">
          <p>Artikel</p>
          <h1>{post.title}</h1>
          {post.excerpt && <span>{post.excerpt}</span>}
        </div>
      </section>

      <article className="public-article">
        {post.created_at && (
          <small>
            Dipublikasikan{" "}
            {new Date(post.created_at).toLocaleDateString("id-ID")}
          </small>
        )}

        <div className="public-article-body">
          {lines.map((line, index) => {
            if (line.startsWith("### ")) {
              return <h3 key={index}>{line.replace("### ", "")}</h3>;
            }

            if (line.startsWith("## ")) {
              return <h2 key={index}>{line.replace("## ", "")}</h2>;
            }

            if (line.startsWith("> ")) {
              return <blockquote key={index}>{line.replace("> ", "")}</blockquote>;
            }

            if (line.startsWith("- ")) {
              return <li key={index}>{line.replace("- ", "")}</li>;
            }

            if (!line.trim()) {
              return <br key={index} />;
            }

            return <p key={index}>{line}</p>;
          })}
        </div>
      </article>
    </main>
  );
}
