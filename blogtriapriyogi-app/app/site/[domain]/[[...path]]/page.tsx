import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    domain: string;
    path?: string[];
  }>;
};

function cleanDomain(value: string) {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\.$/, "");
}

function titleFromDomain(domain: string) {
  return domain
    .split(".")[0]
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function SiteDomainPage({ params }: PageProps) {
  const resolvedParams = await params;
  const domain = cleanDomain(resolvedParams.domain);
  const path = resolvedParams.path || [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let siteName = titleFromDomain(domain);
  let description = "Website ini dibuat dengan Tri Apriyogi Studio.";
  let slug = domain.split(".")[0];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: domainRow } = await supabase
      .from("domains")
      .select("domain, site_id")
      .eq("domain", domain)
      .maybeSingle();

    if (domainRow?.site_id) {
      const { data: siteRow } = await supabase
        .from("sites")
        .select("id, slug, name, description")
        .eq("id", domainRow.site_id)
        .maybeSingle();

      if (siteRow) {
        siteName = siteRow.name || siteName;
        description = siteRow.description || description;
        slug = siteRow.slug || slug;
      }
    } else {
      const { data: profileRow } = await supabase
        .from("public_profiles")
        .select("blog_name, blog_slug, site_description")
        .eq("blog_slug", slug)
        .maybeSingle();

      if (profileRow) {
        siteName = profileRow.blog_name || siteName;
        description = profileRow.site_description || description;
        slug = profileRow.blog_slug || slug;
      }
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "48px", fontFamily: "system-ui" }}>
      <p style={{ color: "#6b7280", marginBottom: "12px" }}>
        {domain}
      </p>

      <h1 style={{ fontSize: "42px", margin: "0 0 16px" }}>
        {siteName}
      </h1>

      <p style={{ fontSize: "18px", color: "#4b5563", maxWidth: "720px" }}>
        {description}
      </p>

      <div style={{ marginTop: "32px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "16px" }}>
        <strong>Domain aktif:</strong> {domain}
        <br />
        <strong>Slug:</strong> {slug}
        <br />
        <strong>Path:</strong> {path.length ? path.join("/") : "home"}
      </div>
    </main>
  );
}
