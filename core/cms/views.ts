import { supabase } from "@/lib/supabase"

export async function incrementView(slug: string) {
  const { data } = await supabase
    .from("posts")
    .select("view_count")
    .eq("slug", slug)
    .single()

  await supabase
    .from("posts")
    .update({ view_count: (data?.view_count || 0) + 1 })
    .eq("slug", slug)
}
