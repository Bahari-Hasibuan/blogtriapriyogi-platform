import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ site: string }>;
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
  created_at: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

async function fetchPosts(userId: string): Promise<PublicPost[]> {
  if (!supabaseUrl || !anonKey) return [];

  const res = await fetch(
    `${supabaseUrl}/rest/v1/posts?user_id=eq.${encodeURIComponent(
      userId
    )}&status=eq.published&select=id,title,slug,excerpt,created_at&order=created_at.desc&limit=12`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return [];
  return (await res.json()) as PublicPost[];
}

export async function generateMetadata({ params }: PageProps) {
  const { site } = await params;
  const profile = await fetchPublicProfile(site);

  if (!profile) {
    return {
      title: "Platform tidak ditemukan",
    };
  }

  const description =
    profile.site_description ||
    `${profile.blog_name} adalah platform digital profesional.`;

  return {
    title: profile.blog_name,
    description,
    openGraph: {
      title: profile.blog_name,
      description,
      type: "website",
    },
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { site } = await params;
  const profile = await fetchPublicProfile(site);

  if (!profile) notFound();

  const posts = await fetchPosts(profile.id);

  const description =
    profile.site_description ||
    `${profile.blog_name} adalah platform digital profesional.`;

  return (
    <main className="public-site-page">
      <section className="public-hero">
        <div className="public-brand">
          <span>{profile.blog_name.slice(0, 2).toUpperCase()}</span>
          <div>
            <b>{profile.blog_name}</b>
            <small>{profile.blog_category || "Platform Digital"}</small>
          </div>
        </div>

        <div className="public-hero-content">
          <p>{profile.blog_category || "Platform Digital"}</p>
          <h1>{profile.blog_name}</h1>
          <span>{description}</span>
        </div>

        <div className="public-address">
          <small>Alamat publik</small>
          <b>{profile.blog_slug}.triapriyogi.com</b>
        </div>
      </section>

      <section className="public-content">
        <div className="public-section-title">
          <p>Publikasi</p>
          <h2>Artikel terbaru</h2>
        </div>

        {posts.length > 0 ? (
          <div className="public-post-grid">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`https://${profile.blog_slug}.triapriyogi.com/${post.slug || post.id}.html`}
                className="public-post-card"
              >
                <small>
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString("id-ID")
                    : "Artikel"}
                </small>
                <h3>{post.title}</h3>
                <p>{post.excerpt || "Baca artikel terbaru dari platform ini."}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="public-empty">
            <b>Belum ada artikel publik.</b>
            <span>Konten yang dipublikasikan akan tampil di halaman ini.</span>
          </div>
        )}
      </section>
    </main>
  );
}
