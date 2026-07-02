import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PublicHome from "./_public_home";
import PublicSite29 from "@/components/site29/PublicSite29";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  const host = headers().get("host")?.split(":")[0] ?? "";

  if (host === "studio.triapriyogi.com") {
    redirect("https://studio.triapriyogi.com/dashboard");
  }

  if (host === "triapriyogi.com" || host === "www.triapriyogi.com" || host.includes("github.dev")) {
    return <PublicHome />;
  }

  return <PublicSite29 host={host} />;
}
