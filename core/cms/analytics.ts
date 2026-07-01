import { supabase } from "@/lib/supabase"

export async function trackView(slug: string) {
  const { data } = await supabase
    .from("posts")
    .select("views")
    .eq("slug", slug)
    .single()

  await supabase
    .from("posts")
    .update({
      views: (data?.views || 0) + 1
    })
    .eq("slug", slug)
}
