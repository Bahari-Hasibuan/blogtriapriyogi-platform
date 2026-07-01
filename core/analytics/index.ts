import { supabase } from "@/lib/supabase"

export async function trackView(postId: string) {
  await supabase.from("analytics").insert([
    {
      post_id: postId,
      type: "view",
      created_at: new Date()
    }
  ])
}
