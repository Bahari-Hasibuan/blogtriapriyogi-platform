import { headers } from 'next/headers';

export default async function Head() {
  const h = await headers();
  const host = h.get('host');

  return (
    <>
      <title>Blog SaaS</title>
    </>
  );
}
