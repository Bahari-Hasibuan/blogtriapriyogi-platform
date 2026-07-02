import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MainLogin from "../_main_login";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  const host = headers().get("host")?.split(":")[0] ?? "";

  if (host === "studio.triapriyogi.com") {
    redirect("https://triapriyogi.com/login");
  }

  return <MainLogin />;
}
