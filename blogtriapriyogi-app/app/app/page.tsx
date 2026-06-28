export default function Page() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold">
        BLOG TRIAPRIYOGI APP
      </h1>

      <div className="mt-6 rounded border p-4">
        <p>App status: ready</p>
        <p>Database: Supabase SQL</p>
        <p>ORM: not using Prisma</p>
      </div>

      <div className="mt-6 rounded border p-4">
        <p>Test database connection:</p>
        <a href="/api/db-test" className="underline">
          Open /api/db-test
        </a>
      </div>
    </main>
  )
}
