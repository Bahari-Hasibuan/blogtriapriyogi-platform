export default async function Page({ params }: any) {
  const { domain, path } = await params;

  return (
    <div style={{ padding: 20 }}>
      <h1>Domain Active</h1>
      <p>Domain: {domain}</p>
      <p>Path: {path?.join("/") || "home"}</p>
    </div>
  );
}
