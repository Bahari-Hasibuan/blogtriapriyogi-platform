import { notFound } from 'next/navigation'
import { Pool } from 'pg'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    site: string
    article: string
  }
}

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  status: string
  published_at: string | null
  created_at: string
}

async function getPost(article: string): Promise<Post | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum tersedia')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 1,
    connectionTimeoutMillis: 15000,
  })

  try {
    const result = await pool.query(
      `
      select
        id,
        title,
        slug,
        excerpt,
        content,
        status,
        published_at,
        created_at
      from posts
      where slug = $1
      limit 1
      `,
      [article]
    )

    return result.rows[0] || null
  } finally {
    await pool.end()
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const post = await getPost(params.article)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <p className="mb-4 text-sm font-medium text-violet-600">
          {params.site}
        </p>

        <h1 className="mb-4 text-4xl font-bold leading-tight">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mb-8 text-lg leading-8 text-slate-600">
            {post.excerpt}
          </p>
        ) : null}

        <div className="whitespace-pre-wrap text-base leading-8 text-slate-800">
          {post.content || 'Konten artikel belum tersedia.'}
        </div>
      </article>
    </main>
  )
}
