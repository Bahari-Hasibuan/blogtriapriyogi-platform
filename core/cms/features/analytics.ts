import { supabase } from "@/lib/supabase"

export async function increaseView(post_id: string) {
  const { data } = await supabase
    .from("post_views")
    .select("*")
    .eq("post_id", post_id)
    .single()

  if (!data) {
    await supabase.from("post_views").insert([
      { post_id, views: 1 }
    ])
  } else {
    await supabase
      .from("post_views")
      .update({ views: data.views + 1 })
      .eq("post_id", post_id)
  }
}

export async function getViews(post_id: string) {
  const { data } = await supabase
    .from("post_views")
    .select("views")
    .eq("post_id", post_id)
    .single()

  return data?.views || 0
}
