import { headers } from "next/headers";
import PublicSite29 from "@/components/site29/PublicSite29";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: {
    slug: string;
  };
  searchParams?: {
    title?: string;
  };
};

export default function Page({ params, searchParams }: Props) {
  const host = headers().get("host")?.split(":")[0] ?? "";
  const title = searchParams?.title || params.slug.replace(/-/g, " ");

  return <PublicSite29 host={host} mode="post" postTitle={title} />;
}
