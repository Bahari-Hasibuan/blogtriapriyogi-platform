import { headers } from "next/headers";
import { resolveFavicon } from "@/lib/favicon/resolve";

export default function Head() {
  const host = headers().get("host");
  
  const favicon = resolveFavicon(host, null);

  return (
    <>
      <link rel="icon" href={favicon} />
    </>
  );
}
