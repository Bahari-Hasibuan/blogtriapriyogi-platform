import { supabase } from "@/lib/supabase"
import { createVersion } from "../versioning"

export async function createPost(data: any) {
  const { data: post, error } = await supabase
    .from("posts")
    .insert([{
      ...data,
      version: 1
    }])
    .select()
    .single()

  if (error) throw error
  return post
}

export async function updatePost(slug: string, data: any) {
  const { data: existing } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single()

  const { data: updated } = await supabase
    .from("posts")
    .update({
      ...data,
      version: createVersion(existing.version)
    })
    .eq("slug", slug)
    .select()
    .single()

  return updated
}

export async function getPosts() {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")

  return data
}
