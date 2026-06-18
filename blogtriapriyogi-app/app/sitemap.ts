import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type PublicProfile = {
  blog_slug: string;
  updated_at: string | null;
};

async function fetchProfiles(): Promise<PublicProfile[]> {
  if (!siteUrl || !anonKey) return [];

  const res = await fetch(
    `${siteUrl}/rest/v1/public_profiles?select=blog_slug,updated_at`,
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

  const publicPages = profiles.map((profile) => ({
    url: `https://triapriyogi.com/${profile.blog_slug}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...base, ...publicPages];
}
