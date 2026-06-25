import { headers } from "next/headers";

export default function Page() {
  const h = headers();
  const tenant = h.get("x-tenant");

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 SaaS Multi Tenant Active</h1>
      <p>Tenant: {tenant}</p>
    </div>
  );
}
