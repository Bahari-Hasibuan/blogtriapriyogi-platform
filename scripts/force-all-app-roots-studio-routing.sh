set -e

echo "== cari semua folder app yang mungkin dipakai Vercel =="
APP_DIRS=$(find . \
  \( -path "./node_modules" -o -path "./.next" -o -path "./.git" -o -path "./.vercel" \) -prune -o \
  -type d -name app -print)

echo "$APP_DIRS"

echo "== cari teks lama di seluruh repo =="
grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git "Bangun blog profesional\|Pengaturan platform\|Tema Premium Light\|Masuk ke dashboard" . || true

echo "== patch semua app/page.tsx =="
echo "$APP_DIRS" | while IFS= read -r appdir; do
  [ -z "$appdir" ] && continue

  page="$appdir/page.tsx"
  rootdir="$(dirname "$appdir")"

  if [ -f "$page" ]; then
    echo "patch root page: $page"

    if ! grep -q "HostRouterRoot" "$page"; then
      cp "$page" "$appdir/_public_home.tsx"
    fi

    if [ ! -f "$appdir/_public_home.tsx" ]; then
      cat > "$appdir/_public_home.tsx" <<'TSX'
export default function PublicHomeFallback() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <h1>Tri Apri Yogi</h1>
    </main>
  );
}
TSX
    fi

    cat > "$page" <<'TSX'
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PublicHome from "./_public_home";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HostRouterRoot() {
  const host = headers().get("host")?.split(":")[0] ?? "";

  if (host === "studio.triapriyogi.com") {
    redirect("https://studio.triapriyogi.com/dashboard");
  }

  return <PublicHome />;
}
TSX
  fi

  echo "patch middleware root: $rootdir/middleware.ts"
  cat > "$rootdir/middleware.ts" <<'TS'
import { NextRequest, NextResponse } from "next/server";

const STUDIO_HOST = "studio.triapriyogi.com";
const MAIN_HOST = "triapriyogi.com";
const MAIN_HOSTS = ["triapriyogi.com", "www.triapriyogi.com"];

const studioOnlyPaths = [
  "/dashboard",
  "/admin",
  "/editor",
  "/page-editor",
  "/posts",
  "/analytics",
  "/settings",
  "/profile",
  "/studio",
];

const authPaths = ["/login", "/signup", "/forgot-password"];

function isPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (host === STUDIO_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url, 307);
  }

  if (host === STUDIO_HOST && isPath(pathname, authPaths)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = MAIN_HOST;
    return NextResponse.redirect(url, 307);
  }

  if (MAIN_HOSTS.includes(host) && isPath(pathname, studioOnlyPaths)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
TS

  mkdir -p "$appdir/dashboard"
  cat > "$appdir/dashboard/page.tsx" <<'TSX'
export const dynamic = "force-dynamic";
export const revalidate = 0;

const cards = [
  ["Total Konten", "128", "Artikel, halaman, dan draft."],
  ["Halaman", "42", "Landing, profil, pricing, dan policy."],
  ["Kunjungan", "8.4K", "Performa publik bulan ini."],
  ["Draft", "16", "Menunggu publikasi."],
];

export default function DashboardPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg,#f8f5ff,#eef9ff)",
      color: "#12111f",
      fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
    }}>
      <aside style={{
        width: 300,
        background: "#05040d",
        color: "#fff",
        padding: 28,
        minHeight: "100vh"
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 30 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg,#7c3aed,#0ea5e9)",
            fontWeight: 900
          }}>TA</div>
          <div>
            <b>Tri Apri Yogi</b>
            <div style={{ fontSize: 11, color: "#aaa4c3", letterSpacing: 2 }}>STUDIO DASHBOARD</div>
          </div>
        </div>

        {[
          "Command Center",
          "Admin Control",
          "Article Studio",
          "Page Builder",
          "Content Library",
          "Growth Analytics",
          "System Settings"
        ].map((item, index) => (
          <div key={item} style={{
            padding: "14px 15px",
            borderRadius: 16,
            marginBottom: 8,
            background: index === 0 ? "linear-gradient(135deg,#7c3aed,#0ea5e9)" : "transparent",
            color: index === 0 ? "#fff" : "#c8c1dc"
          }}>
            {item}
          </div>
        ))}
      </aside>

      <section style={{ flex: 1, padding: "44px min(5vw,70px)" }}>
        <p style={{ color: "#7c3aed", fontWeight: 900, letterSpacing: 4, fontSize: 12 }}>
          CREATOR STUDIO V24
        </p>

        <h1 style={{
          fontSize: "clamp(42px,6vw,80px)",
          lineHeight: .9,
          letterSpacing: "-0.075em",
          margin: 0,
          maxWidth: 900
        }}>
          Dashboard studio sudah benar.
        </h1>

        <p style={{ color: "#6b647d", lineHeight: 1.7, maxWidth: 720, fontSize: 16 }}>
          Jika halaman ini tampil, berarti studio.triapriyogi.com sudah tidak memakai landing page publik.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 16,
          marginTop: 28
        }}>
          {cards.map(([label, value, help]) => (
            <div key={label} style={{
              background: "rgba(255,255,255,.92)",
              borderRadius: 30,
              padding: 24,
              boxShadow: "0 22px 70px rgba(30,20,70,.08)"
            }}>
              <span style={{ color: "#8b849b", fontSize: 13 }}>{label}</span>
              <strong style={{
                display: "block",
                margin: "12px 0 8px",
                fontSize: 38,
                letterSpacing: "-0.06em"
              }}>
                {value}
              </strong>
              <p style={{ color: "#6b647d", margin: 0 }}>{help}</p>
            </div>
          ))}
        </div>

        <section style={{
          background: "rgba(255,255,255,.92)",
          borderRadius: 34,
          padding: 30,
          marginTop: 20,
          boxShadow: "0 22px 70px rgba(30,20,70,.08)"
        }}>
          <h2 style={{ fontSize: 30, marginTop: 0 }}>Routing status</h2>
          <p>triapriyogi.com = landing publik.</p>
          <p>triapriyogi.com/login = login utama.</p>
          <p>studio.triapriyogi.com = dashboard studio.</p>
        </section>
      </section>
    </main>
  );
}
TSX

  if [ -d "$appdir/login" ] || [ -f "$appdir/login/page.tsx" ]; then
    mkdir -p "$appdir/login"
    loginpage="$appdir/login/page.tsx"

    if [ -f "$loginpage" ] && ! grep -q "HostRouterLogin" "$loginpage"; then
      cp "$loginpage" "$appdir/_main_login.tsx"
    fi

    if [ -f "$appdir/_main_login.tsx" ]; then
      cat > "$loginpage" <<'TSX'
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MainLogin from "../_main_login";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HostRouterLogin() {
  const host = headers().get("host")?.split(":")[0] ?? "";

  if (host === "studio.triapriyogi.com") {
    redirect("https://triapriyogi.com/login");
  }

  return <MainLogin />;
}
TSX
    fi
  fi
done

echo "== hasil file app/page.tsx yang aktif di repo =="
find . \
  \( -path "./node_modules" -o -path "./.next" -o -path "./.git" -o -path "./.vercel" \) -prune -o \
  -type f -path "*/app/page.tsx" -print -exec sed -n '1,35p' {} \;

echo "== selesai patch semua app root =="
git status --short
