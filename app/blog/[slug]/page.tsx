import { getPostBySlug } from "@/core/cms/engine"

export default async function BlogPost({ params }: any) {
  const post = await getPostBySlug(params.slug)

  if (!post) return <div>Not Found</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-4">{post.content}</p>
    </div>
  )
}
