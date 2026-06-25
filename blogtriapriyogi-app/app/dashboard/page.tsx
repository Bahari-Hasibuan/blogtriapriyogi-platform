import { headers } from 'next/headers'

export default async function Page() {
  const h = await headers()
  const tenant = h.get('x-tenant')

  return (
    <div style={{ padding: 20 }}>
      Dashboard Tenant: {tenant}
    </div>
  )
}
