export type View = "dashboard" | "builder" | "library" | "domains" | "settings";
export type BuilderTab = "article" | "page" | "theme" | "seo";

export type PostItem = {
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Review" | "Published";
  score: number;
  bodyHtml: string;
  updatedAt: string;
};

export type SeoState = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  allowIndex: boolean;
};

export type DomainState = {
  customDomain: string;
  saved: boolean;
  verified: boolean;
  lastChecked: string;
  message: string;
};

export type SiteState = {
  owner: string;
  siteName: string;
  siteType: string;
  slug: string;
  templateId: string;
  themeHtml: string;
  themeCss: string;
  articleTitle: string;
  articleHtml: string;
  pageHtml: string;
  seo: SeoState;
  domain: DomainState;
  posts: PostItem[];
};

export type TemplateItem = {
  id: string;
  name: string;
  category: string;
  layout: string;
  c1: string;
  c2: string;
  bg: string;
  use: string;
  html: string;
  css: string;
};

const categories = [
  "Blog Bisnis",
  "Toko Online",
  "Portfolio",
  "Komunitas",
  "Landing Page",
  "Media Artikel",
  "Brand Personal",
  "Jasa Profesional",
  "Katalog Produk",
  "Kelas Digital",
];

const layouts = [
  "Hero Split",
  "Magazine Grid",
  "Product Shelf",
  "Creator Profile",
  "Agency Clean",
  "Editorial Dark",
  "Minimal Store",
  "Community Hub",
  "Course Landing",
  "Service Funnel",
];

const palettes = [
  ["#7c3aed", "#0ea5e9", "#f8f6ff"],
  ["#0f172a", "#64748b", "#f8fafc"],
  ["#16a34a", "#84cc16", "#f7fee7"],
  ["#ea580c", "#f43f5e", "#fff7ed"],
  ["#0369a1", "#06b6d4", "#ecfeff"],
  ["#4c1d95", "#c026d3", "#faf5ff"],
  ["#be123c", "#fb7185", "#fff1f2"],
  ["#047857", "#14b8a6", "#ecfdf5"],
  ["#1d4ed8", "#60a5fa", "#eff6ff"],
  ["#4338ca", "#a855f7", "#f5f3ff"],
];

export const templates: TemplateItem[] = categories.flatMap((category, categoryIndex) =>
  layouts.flatMap((layout, layoutIndex) =>
    palettes.map(([c1, c2, bg], paletteIndex) => {
      const id = `tpl-${categoryIndex + 1}-${layoutIndex + 1}-${paletteIndex + 1}`;
      return {
        id,
        name: `${category} ${layout}`,
        category,
        layout,
        c1,
        c2,
        bg,
        use: `${category} dengan model ${layout}`,
        html: `<section class="theme-block"><h2>${category}</h2><p>Template ${layout} untuk situs, blog, brand, toko, bisnis, atau komunitas.</p><button>Mulai Sekarang</button></section>`,
        css: `.theme-block{padding:34px;border-radius:28px;background:${bg};border:1px solid rgba(15,23,42,.08)}.theme-block h2{font-size:42px;line-height:1;margin:0 0 12px}.theme-block p{line-height:1.8;color:#475569}.theme-block button{border:0;border-radius:999px;padding:14px 18px;background:${c1};color:white;font-weight:800}`,
      };
    })
  )
).slice(0, 1000);

export function getTemplate(id: string) {
  return templates.find((item) => item.id === id) || templates[0];
}

export function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 42) || "my-site";
}

export const starterSite: SiteState = {
  owner: "Tri Apri Yogi",
  siteName: "Yogi Creator Hub",
  siteType: "Blog bisnis",
  slug: "yogi",
  templateId: "tpl-1-1-1",
  themeHtml:
    "<section class='custom-theme'><h2>Custom Theme Block</h2><p>Edit HTML tema ini, lalu klik Simpan Tema.</p></section>",
  themeCss:
    ".custom-theme{padding:32px;border-radius:28px;background:#f5f3ff}.custom-theme h2{font-size:36px;margin:0 0 10px}.custom-theme p{color:#475569;line-height:1.8}",
  articleTitle: "Artikel Pertama Saya",
  articleHtml:
    "<h1>Artikel Pertama Saya</h1><p>Ini adalah editor artikel dengan HTML. Konten bisa disimpan ke library dan dibuka sebagai post publik.</p>",
  pageHtml:
    "<section><h2>Tentang Brand</h2><p>Halaman ini bisa dipakai untuk bisnis, toko, komunitas, jasa, atau brand personal.</p><button>Hubungi Kami</button></section>",
  seo: {
    title: "Yogi Creator Hub",
    description: "Situs publik untuk artikel, halaman, brand, dan bisnis.",
    keywords: "blog, bisnis, artikel, website",
    canonical: "https://yogi.triapriyogi.com",
    ogTitle: "Yogi Creator Hub",
    ogDescription: "Bangun situs dan konten dari satu workspace.",
    allowIndex: true,
  },
  domain: {
    customDomain: "",
    saved: false,
    verified: false,
    lastChecked: "",
    message: "Domain belum disimpan.",
  },
  posts: [
    {
      id: "p1",
      title: "Panduan Membuat Blog Modern",
      slug: "panduan-membuat-blog-modern",
      status: "Published",
      score: 94,
      updatedAt: "Hari ini",
      bodyHtml:
        "<h1>Panduan Membuat Blog Modern</h1><p>Postingan ini bisa dibuka dari tab browser baru.</p>",
    },
  ],
};
