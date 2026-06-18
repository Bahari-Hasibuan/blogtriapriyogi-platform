import type { MetadataRoute } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type PublicProfile = {
  id: string;
  blog_slug: string;
  updated_at: string | null;
};

type PublicPost = {
  slug: string | null;
  updated_at: string | null;
  created_at: string | null;
};

async function fetchProfiles(): Promise<PublicProfile[]> {
  if (!supabaseUrl || !anonKey) return [];

  const res = await fetch(
    `${supabaseUrl}/rest/v1/public_profiles?select=id,blog_slug,updated_at`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return [];
  return (await res.json()) as PublicProfile[];
}

async function fetchPosts(userId: string): Promise<PublicPost[]> {
  if (!supabaseUrl || !anonKey) return [];

  const res = await fetch(
    `${supabaseUrl}/rest/v1/posts?user_id=eq.${encodeURIComponent(
      userId
    )}&status=eq.published&select=slug,updated_at,created_at`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return [];
  return (await res.json()) as PublicPost[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await fetchProfiles();

  const base: MetadataRoute.Sitemap = [
    {
      url: "https://triapriyogi.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const publicPages: MetadataRoute.Sitemap = [];

  for (const profile of profiles) {
    publicPages.push({
      url: `https://${profile.blog_slug}.triapriyogi.com`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    const posts = await fetchPosts(profile.id);

    for (const post of posts) {
      if (!post.slug) continue;

      publicPages.push({
        url: `https://${profile.blog_slug}.triapriyogi.com/${post.slug}.html`,
        lastModified: post.updated_at
          ? new Date(post.updated_at)
          : post.created_at
          ? new Date(post.created_at)
          : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return [...base, ...publicPages];
}
