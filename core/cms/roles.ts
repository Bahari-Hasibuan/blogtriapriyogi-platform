import { supabase } from "@/lib/supabase"

export async function getUserRole(userId: string, workspaceId: string) {
  const { data } = await supabase
    .from("roles")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single()

  return data?.role || "writer"
}
