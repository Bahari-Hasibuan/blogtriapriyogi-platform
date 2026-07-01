import { supabase } from "@/lib/supabase"

export async function addTag(name: string) {
  return await supabase.from("tags").insert([{ name }])
}

export async function attachTag(post_id: string, tag_id: string) {
  return await supabase.from("post_tags").insert([
    { post_id, tag_id }
  ])
}
