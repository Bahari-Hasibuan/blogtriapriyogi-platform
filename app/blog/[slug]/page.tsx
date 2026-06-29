import { notFound } from "next/navigation"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

function getPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pool = getPool()

  try {
    const result = await pool.query(
      `
      select
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        meta_title,
        meta_description,
        published_at,
        created_at
      from public.posts
      where slug = $1
        and content_type = 'post'
        and status = 'published'
        and deleted_at is null
      limit 1
      `,
      [slug]
    )

    const post = result.rows[0]

    if (!post) {
      notFound()
    }

    return (
      <main style={{ maxWidth: 860, margin: "0 auto", padding: 32, fontFamily: "Arial, sans-serif" }}>
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            style={{
              width: "100%",
              borderRadius: 24,
              marginBottom: 28,
              objectFit: "cover",
              maxHeight: 420,
            }}
          />
        ) : null}

        <p style={{ color: "#667085", marginBottom: 8 }}>Artikel</p>

        <h1 style={{ fontSize: 44, lineHeight: 1.1, marginBottom: 16 }}>
          {post.title}
        </h1>

        {post.excerpt ? (
          <p style={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
            {post.excerpt}
          </p>
        ) : null}

        <article
          style={{
            marginTop: 32,
            fontSize: 18,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {post.content}
        </article>
      </main>
    )
  } finally {
    await pool.end()
  }
}
