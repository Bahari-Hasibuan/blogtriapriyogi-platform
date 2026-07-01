import { supabase } from "@/lib/supabase"

export async function searchPosts(query: string) {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .ilike("title", `%${query}%`)

  return data
}
