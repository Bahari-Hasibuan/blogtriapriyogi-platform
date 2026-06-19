import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SitePage({ params }: any) {
  const userId = params.userId;

  const { data: domains } = await supabase
    .from("site_domains")
    .select("*")
    .eq("user_id", userId);

  return (
    <div style={{ padding: 20 }}>
      <h1>Website User</h1>

      {domains?.map((d: any) => (
        <div key={d.id}>
          <h3>{d.hostname}</h3>
          <p>Status: {d.status}</p>
        </div>
      ))}
    </div>
  );
}
