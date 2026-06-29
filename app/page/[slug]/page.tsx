import { notFound } from "next/navigation"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

function getPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
}

export default async function PageDetailPage({
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
        and content_type = 'page'
        and status = 'published'
        and deleted_at is null
      limit 1
      `,
      [slug]
    )

    const page = result.rows[0]

    if (!page) {
      notFound()
    }

    return (
      <main style={{ maxWidth: 860, margin: "0 auto", padding: 32, fontFamily: "Arial, sans-serif" }}>
        <p style={{ color: "#667085", marginBottom: 8 }}>Halaman</p>

        <h1 style={{ fontSize: 44, lineHeight: 1.1, marginBottom: 16 }}>
          {page.title}
        </h1>

        {page.excerpt ? (
          <p style={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
            {page.excerpt}
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
          {page.content}
        </article>
      </main>
    )
  } finally {
    await pool.end()
  }
}
