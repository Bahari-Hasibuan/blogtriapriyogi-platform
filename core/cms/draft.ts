import { supabase } from "@/lib/supabase"

export async function saveDraft(data: any) {
  return await supabase.from("posts").insert({
    ...data,
    status: "draft"
  })
}
