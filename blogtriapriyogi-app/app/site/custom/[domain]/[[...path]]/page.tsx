import { createClient } from "@supabase/supabase-js";
import PublicSite31 from "@/components/studio31/PublicSite31";
import { starterSite, SiteState } from "@/components/studio31/studio31Data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function readSite(domain: string): Promise<SiteState> {
  const supabase = getClient();

  if (supabase) {
    const { data } = await supabase.from("studio_sites").select("site").eq("custom_domain", domain).maybeSingle();
    if (data?.site) return data.site as SiteState;
  }

  return {
    ...starterSite,
    slug: domain.replace(/\./g, "-"),
    domain: {
      ...starterSite.domain,
      customDomain: domain,
    },
  };
}

export default async function Page({
  params,
}: {
  params: { domain: string; path?: string[] };
}) {
  const site = await readSite(params.domain);
  return <PublicSite31 site={site} path={params.path} />;
}
