import { PostPreview } from "@/components/studio28/PreviewClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({ params }: { params: { id: string } }) {
  return <PostPreview id={params.id} />;
}
