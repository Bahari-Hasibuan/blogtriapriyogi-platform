import { supabase } from "@/lib/supabase"

export async function saveDraft(post_id: string, data: any) {
  const { data: draft } = await supabase
    .from("post_drafts")
    .insert([
      {
        post_id,
        title: data.title,
        content: data.content,
        version: data.version || 1,
        autosaved: true
      }
    ])

  return draft
}

export async function getDrafts(post_id: string) {
  const { data } = await supabase
    .from("post_drafts")
    .select("*")
    .eq("post_id", post_id)

  return data
}
