import Studio30App from "@/components/studio30/Studio30App";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return <Studio30App view="builder" />;
}
