set -e

echo "== FORCE CLEAN STUDIO V24 =="

echo "== cari teks lama dulu =="
grep -RIn "Pengaturan platform\|Tema Premium Light\|Simpan Pengaturan\|Masuk ke dashboard" app components || true

echo "== backup lama =="
mkdir -p .backup-studio-v24

cp -r components/studio .backup-studio-v24/components-studio 2>/dev/null || true
cp -r app/dashboard .backup-studio-v24/app-dashboard 2>/dev/null || true
cp -r app/admin .backup-studio-v24/app-admin 2>/dev/null || true
cp -r app/editor .backup-studio-v24/app-editor 2>/dev/null || true
cp -r app/page-editor .backup-studio-v24/app-page-editor 2>/dev/null || true
cp -r app/posts .backup-studio-v24/app-posts 2>/dev/null || true
cp -r app/analytics .backup-studio-v24/app-analytics 2>/dev/null || true
cp -r app/settings .backup-studio-v24/app-settings 2>/dev/null || true
cp -r app/profile .backup-studio-v24/app-profile 2>/dev/null || true
cp -r app/login .backup-studio-v24/app-login 2>/dev/null || true

echo "== hapus semua halaman studio lama, kecuali app/api =="
find app -path "app/api" -prune -o -type d \( \
  -name dashboard -o \
  -name admin -o \
  -name editor -o \
  -name page-editor -o \
  -name posts -o \
  -name analytics -o \
  -name settings -o \
  -name profile -o \
  -name studio -o \
  -name login \
\) -print -exec rm -rf {} +

rm -rf components/studio

mkdir -p components/studio
mkdir -p app/dashboard app/admin app/editor app/page-editor app/posts app/analytics app/settings app/profile app/studio app/login

cat > components/studio/StudioShell.module.css <<'CSS'
.page {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(circle at 88% 0%, rgba(124, 58, 237, .35), transparent 32%),
    radial-gradient(circle at 18% 12%, rgba(14, 165, 233, .18), transparent 30%),
    linear-gradient(135deg, #f8f5ff 0%, #eef9ff 100%);
  color: #111021;
}

.sidebar {
  width: 310px;
  min-height: 100vh;
  background: #05040d;
  color: #fff;
  padding: 28px 20px;
  position: sticky;
  top: 0;
  box-shadow: 28px 0 80px rgba(10, 8, 24, .28);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
}

.logo {
  width: 44px;
  height: 44px;
  border-radius: 17px;
  display: grid;
  place-items: center;
  font-weight: 950;
  background: linear-gradient(135deg, #7c3aed, #0ea5e9);
}

.brand strong {
  display: block;
  font-size: 15px;
}

.brand span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #aaa4c3;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}

.menu {
  display: grid;
  gap: 8px;
}

.link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 15px;
  border-radius: 17px;
  color: #c8c1dc;
  text-decoration: none;
  font-size: 14px;
}

.link:hover,
.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(124, 58, 237, .95), rgba(14, 165, 233, .55));
}

.version {
  margin-top: 28px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255,255,255,.08);
  color: #d4cde8;
  font-size: 12px;
  line-height: 1.7;
}

.main {
  flex: 1;
  padding: 40px min(5vw, 70px);
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 4px;
}

.hero h1 {
  margin: 0;
  max-width: 880px;
  font-size: clamp(42px, 6vw, 80px);
  line-height: .9;
  letter-spacing: -0.075em;
}

.hero p {
  max-width: 760px;
  color: #6b647d;
  line-height: 1.7;
  font-size: 16px;
}

.cta {
  height: fit-content;
  padding: 15px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  font-weight: 950;
  text-decoration: none;
  box-shadow: 0 20px 46px rgba(124, 58, 237, .28);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat,
.panel,
.card {
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(255,255,255,.78);
  box-shadow: 0 22px 70px rgba(30, 20, 70, .08);
}

.stat {
  border-radius: 30px;
  padding: 24px;
}

.stat span {
  color: #8b849b;
  font-size: 13px;
}

.stat strong {
  display: block;
  margin: 12px 0 8px;
  font-size: 38px;
  letter-spacing: -0.06em;
}

.stat p,
.card p {
  color: #6b647d;
  line-height: 1.6;
  margin: 0;
}

.panel {
  border-radius: 34px;
  padding: 30px;
  margin-bottom: 20px;
}

.panel h2 {
  margin: 0 0 20px;
  font-size: 30px;
  letter-spacing: -0.045em;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}

.card {
  border-radius: 28px;
  padding: 24px;
}

.card h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.table {
  display: grid;
}

.row {
  display: grid;
  grid-template-columns: 1fr 120px 90px;
  gap: 12px;
  padding: 16px 8px;
  border-bottom: 1px solid #eee9f8;
  align-items: center;
}

.row b {
  width: fit-content;
  padding: 7px 11px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 12px;
}

.row em {
  color: #6b647d;
  font-style: normal;
  font-weight: 800;
}

.form {
  display: grid;
  gap: 14px;
}

.form input,
.form textarea,
.form select {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #e7e1f5;
  font: inherit;
  outline: none;
}

.form textarea {
  min-height: 220px;
}

.form button {
  border: 0;
  border-radius: 999px;
  padding: 16px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-weight: 950;
}

.loginPage {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 70% 5%, rgba(124, 58, 237, .28), transparent 28%),
    linear-gradient(135deg, #f7f4ff, #eef9ff);
  padding: 24px;
}

.loginCard {
  width: min(460px, 100%);
  border-radius: 34px;
  padding: 34px;
  background: rgba(255,255,255,.92);
  box-shadow: 0 28px 90px rgba(30, 20, 70, .14);
}

.loginCard h1 {
  margin: 18px 0 10px;
  font-size: 40px;
  letter-spacing: -0.06em;
}

.loginCard p {
  color: #6b647d;
  line-height: 1.6;
}

@media (max-width: 820px) {
  .page {
    display: block;
  }

  .sidebar {
    width: auto;
    min-height: auto;
    position: relative;
  }

  .main {
    padding: 24px 16px;
  }

  .hero {
    display: grid;
  }

  .row {
    grid-template-columns: 1fr;
  }
}
CSS

cat > components/studio/StudioShell.tsx <<'TSX'
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./StudioShell.module.css";

const menus = [
  ["dashboard", "Command Center", "/dashboard"],
  ["admin", "Admin Control", "/admin"],
  ["editor", "Article Studio", "/editor"],
  ["page-editor", "Page Builder", "/page-editor"],
  ["posts", "Content Library", "/posts"],
  ["analytics", "Growth Analytics", "/analytics"],
  ["profile", "Brand Profile", "/profile"],
  ["settings", "System Settings", "/settings"],
];

export function StudioShell({
  active,
  title,
  description,
  children,
}: {
  active: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>TA</div>
          <div>
            <strong>Tri Apri Yogi</strong>
            <span>Creator Studio v24</span>
          </div>
        </div>

        <nav className={styles.menu}>
          {menus.map(([key, label, href]) => (
            <Link
              key={key}
              href={href}
              className={`${styles.link} ${active === key ? styles.active : ""}`}
            >
              <span>{label}</span>
              <b>›</b>
            </Link>
          ))}
        </nav>

        <div className={styles.version}>
          CORE LOCK v2<br />
          Upgrade 24 Active<br />
          Studio route ready
        </div>
      </aside>

      <section className={styles.main}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>STUDIO DASHBOARD</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <Link href="/editor" className={styles.cta}>
            Buat Konten
          </Link>
        </div>

        {children}
      </section>
    </main>
  );
}

export function Stats() {
  return (
    <section className={styles.stats}>
      <div className={styles.stat}>
        <span>Total Konten</span>
        <strong>128</strong>
        <p>Artikel, halaman, draft, dan arsip.</p>
      </div>
      <div className={styles.stat}>
        <span>Halaman</span>
        <strong>42</strong>
        <p>Landing, profil, pricing, dan policy.</p>
      </div>
      <div className={styles.stat}>
        <span>Visitor</span>
        <strong>8.4K</strong>
        <p>Performa publik bulan ini.</p>
      </div>
      <div className={styles.stat}>
        <span>SEO Score</span>
        <strong>94</strong>
        <p>Kualitas optimasi konten.</p>
      </div>
    </section>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Cards({
  items,
}: {
  items: Array<{ title: string; text: string }>;
}) {
  return (
    <div className={styles.cards}>
      {items.map((item) => (
        <article key={item.title} className={styles.card}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ContentTable() {
  return (
    <div className={styles.table}>
      {[
        ["Cara Membuat Blog Premium", "Published", "SEO 94"],
        ["Panduan Domain Custom", "Draft", "SEO 81"],
        ["Strategi Konten Modern", "Review", "SEO 90"],
      ].map(([title, status, score]) => (
        <div key={title} className={styles.row}>
          <span>{title}</span>
          <b>{status}</b>
          <em>{score}</em>
        </div>
      ))}
    </div>
  );
}

export function StudioForm() {
  return (
    <div className={styles.form}>
      <input placeholder="Nama situs" />
      <input placeholder="Domain utama" />
      <input placeholder="Subdomain studio" />
      <select>
        <option>Studio Purple Cloud</option>
        <option>Studio Dark Pro</option>
        <option>Studio Clean White</option>
      </select>
      <button>Simpan Konfigurasi</button>
    </div>
  );
}

export function EditorForm() {
  return (
    <div className={styles.form}>
      <input placeholder="Judul artikel" />
      <input placeholder="Slug artikel" />
      <input placeholder="Meta description" />
      <textarea placeholder="Tulis konten artikel di sini" />
      <button>Simpan Draft</button>
    </div>
  );
}

export function LoginView() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.logo}>TA</div>
        <h1>Masuk ke Creator Studio v24.</h1>
        <p>Login untuk mengelola konten, halaman, SEO, analytics, dan pengaturan sistem.</p>
        <div className={styles.form}>
          <input placeholder="Email admin" />
          <input placeholder="Password" type="password" />
          <button>Masuk ke Studio</button>
        </div>
      </section>
    </main>
  );
}
TSX

cat > app/dashboard/page.tsx <<'TSX'
import { Cards, ContentTable, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="dashboard"
      title="Creator Studio v24 sudah aktif."
      description="Area ini menjadi pusat kontrol artikel, halaman, SEO, analytics, dan workflow publikasi."
    >
      <Stats />
      <Panel title="Konten terbaru">
        <ContentTable />
      </Panel>
      <Panel title="Workflow utama">
        <Cards
          items={[
            { title: "Write", text: "Tulis artikel, simpan draft, dan siapkan publish." },
            { title: "Optimize", text: "Atur slug, meta description, tag, dan SEO score." },
            { title: "Publish", text: "Terbitkan konten dan pantau performanya." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/settings/page.tsx <<'TSX'
import { Cards, Panel, StudioForm, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="settings"
      title="System Settings v24."
      description="Halaman ini sudah diganti total. Tidak ada lagi form lama Tema Premium Light."
    >
      <Panel title="Konfigurasi platform">
        <StudioForm />
      </Panel>
      <Panel title="Modul sistem">
        <Cards
          items={[
            { title: "Domain Routing", text: "triapriyogi.com untuk publik dan studio.triapriyogi.com untuk dashboard." },
            { title: "SEO Defaults", text: "Atur title, description, sitemap, robots, dan canonical." },
            { title: "Security", text: "Siapkan role, login, session, dan proteksi admin." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/editor/page.tsx <<'TSX'
import { Cards, EditorForm, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="editor"
      title="Article Studio."
      description="Ruang tulis artikel dengan composer, SEO, AI helper, dan draft manager."
    >
      <Panel title="Composer">
        <EditorForm />
      </Panel>
      <Panel title="AI tools">
        <Cards
          items={[
            { title: "Outline", text: "Buat struktur artikel dari topik utama." },
            { title: "Rewrite", text: "Perbaiki kalimat agar lebih jelas." },
            { title: "SEO Meta", text: "Buat meta title dan description." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/admin/page.tsx <<'TSX'
import { Cards, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="admin"
      title="Admin Control Center."
      description="Kelola user, role, audit log, keamanan, dan status sistem."
    >
      <Stats />
      <Panel title="Admin modules">
        <Cards
          items={[
            { title: "Role Management", text: "Atur owner, admin, editor, dan writer." },
            { title: "Audit Log", text: "Pantau perubahan konten dan aktivitas login." },
            { title: "System Health", text: "Cek status domain, API, dan deployment." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/posts/page.tsx <<'TSX'
import { ContentTable, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="posts"
      title="Content Library."
      description="Kelola artikel, draft, scheduled post, arsip, kategori, dan tag."
    >
      <Stats />
      <Panel title="Daftar konten">
        <ContentTable />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/analytics/page.tsx <<'TSX'
import { Cards, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="analytics"
      title="Growth Analytics."
      description="Pantau views, CTR, durasi baca, konten terbaik, dan peluang optimasi."
    >
      <Stats />
      <Panel title="Insight">
        <Cards
          items={[
            { title: "Top Content", text: "Artikel panduan memberi trafik tertinggi." },
            { title: "SEO Gap", text: "Beberapa halaman perlu meta description." },
            { title: "Growth", text: "Kunjungan naik dari bulan sebelumnya." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/page-editor/page.tsx <<'TSX'
import { Cards, Panel, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="page-editor"
      title="Page Builder."
      description="Bangun landing page, pricing, profil, policy, dan campaign page."
    >
      <Panel title="Page blocks">
        <Cards
          items={[
            { title: "Hero", text: "Judul besar, CTA, dan visual utama." },
            { title: "Features", text: "Kartu fitur dengan struktur rapi." },
            { title: "CTA", text: "Arahkan pengunjung ke login atau dashboard." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/profile/page.tsx <<'TSX'
import { Cards, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="profile"
      title="Brand Profile."
      description="Kelola profil pemilik, bio publik, link sosial, dan brand kit."
    >
      <Stats />
      <Panel title="Brand kit">
        <Cards
          items={[
            { title: "Bio", text: "Deskripsi singkat untuk halaman publik." },
            { title: "Social Links", text: "Hubungkan Instagram, LinkedIn, GitHub, dan kontak." },
            { title: "Visual Identity", text: "Atur logo, warna, dan tampilan brand." },
          ]}
        />
      </Panel>
    </StudioShell>
  );
}
TSX

cat > app/login/page.tsx <<'TSX'
import { LoginView } from "@/components/studio/StudioShell";

export default function Page() {
  return <LoginView />;
}
TSX

cat > app/studio/page.tsx <<'TSX'
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard");
}
TSX

cat > middleware.ts <<'TS'
import { NextRequest, NextResponse } from "next/server";

const STUDIO_HOST = "studio.triapriyogi.com";
const MAIN_HOSTS = ["triapriyogi.com", "www.triapriyogi.com"];

const studioPaths = [
  "/dashboard",
  "/admin",
  "/editor",
  "/page-editor",
  "/posts",
  "/analytics",
  "/settings",
  "/profile",
  "/login",
  "/signup",
  "/forgot-password",
];

function isStudioPath(pathname: string) {
  return studioPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (host === STUDIO_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.rewrite(url);
  }

  if (MAIN_HOSTS.includes(host) && isStudioPath(pathname)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = STUDIO_HOST;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
TS

echo "== cek teks lama setelah overwrite =="
if grep -RIn "Pengaturan platform\|Tema Premium Light\|Simpan Pengaturan" app components; then
  echo "MASIH ADA TEKS LAMA. STOP."
  exit 1
else
  echo "OK: teks lama sudah hilang dari kode."
fi

echo "== FORCE CLEAN STUDIO V24 DONE =="
git status --short
