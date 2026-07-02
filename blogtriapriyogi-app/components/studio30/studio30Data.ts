export type View = "dashboard" | "builder" | "library" | "domains" | "settings";
export type BuilderTab = "article" | "page" | "theme";

export type PostItem = {
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Review" | "Published";
  score: number;
  bodyHtml: string;
  updatedAt: string;
};

export type SiteState = {
  owner: string;
  siteName: string;
  siteType: string;
  slug: string;
  customDomain: string;
  templateId: string;
  articleTitle: string;
  articleHtml: string;
  pageHtml: string;
  themeHtml: string;
  posts: PostItem[];
};

export const templates = [
  {
    id: "aurora",
    name: "Aurora Commerce",
    use: "Toko, jasa, brand personal",
    c1: "#7c3aed",
    c2: "#0ea5e9",
  },
  {
    id: "noir",
    name: "Noir Editorial",
    use: "Blog premium, media, opini",
    c1: "#0f172a",
    c2: "#64748b",
  },
  {
    id: "lime",
    name: "Lime Startup",
    use: "Bisnis digital, komunitas, landing",
    c1: "#16a34a",
    c2: "#84cc16",
  },
  {
    id: "ember",
    name: "Ember Market",
    use: "Katalog, produk, penawaran",
    c1: "#ea580c",
    c2: "#f43f5e",
  },
  {
    id: "ocean",
    name: "Ocean Creator",
    use: "Portfolio, kelas, produk digital",
    c1: "#0369a1",
    c2: "#06b6d4",
  },
  {
    id: "royal",
    name: "Royal Agency",
    use: "Agensi, jasa profesional, studio",
    c1: "#4c1d95",
    c2: "#c026d3",
  },
];

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
  customDomain: "",
  templateId: "aurora",
  articleTitle: "Artikel Pertama Saya",
  articleHtml:
    "<h1>Artikel Pertama Saya</h1><p>Ini adalah konten artikel yang bisa diedit dengan HTML langsung dari studio.</p><p>Gunakan editor ini untuk membuat post, halaman, toko sederhana, profil brand, dan publikasi konten.</p>",
  pageHtml:
    "<section><h2>Tentang Brand</h2><p>Halaman ini dapat digunakan untuk profil, layanan, produk, komunitas, atau bisnis.</p><button>Hubungi Kami</button></section>",
  themeHtml:
    "<section><h2>Blok Tema Custom</h2><p>Area ini untuk menambahkan HTML khusus ke template aktif.</p></section>",
  posts: [
    {
      id: "p1",
      title: "Panduan Membuat Blog Modern",
      slug: "panduan-membuat-blog-modern",
      status: "Published",
      score: 94,
      updatedAt: "Hari ini",
      bodyHtml:
        "<h1>Panduan Membuat Blog Modern</h1><p>Konten ini tampil pada preview situs dan dapat dibuka di tab baru.</p>",
    },
    {
      id: "p2",
      title: "Strategi Menulis Artikel",
      slug: "strategi-menulis-artikel",
      status: "Draft",
      score: 82,
      updatedAt: "Kemarin",
      bodyHtml:
        "<h1>Strategi Menulis Artikel</h1><p>Draft ini bisa diedit, direview, lalu diterbitkan.</p>",
    },
  ],
};

export function getTemplate(id: string) {
  return templates.find((item) => item.id === id) || templates[0];
}
