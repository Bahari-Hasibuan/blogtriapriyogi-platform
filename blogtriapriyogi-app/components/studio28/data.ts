export type TemplateItem = {
  id: string;
  name: string;
  category: string;
  purpose: string;
  score: number;
  sections: string[];
};

export type PostItem = {
  id: string;
  title: string;
  status: "Draft" | "Review" | "Published";
  score: number;
  updatedAt: string;
  content: string;
};

const categories = [
  "Personal Blog",
  "Business Site",
  "Creator Page",
  "Online Store",
  "Portfolio",
  "Newsroom",
  "Course",
  "Community",
  "Landing Page",
  "Product Page",
];

const purposes = [
  "menulis artikel",
  "menjual produk",
  "membangun profil",
  "membuat landing page",
  "mengelola konten bisnis",
  "menampilkan katalog",
  "membuat halaman promosi",
  "membangun komunitas",
  "menerbitkan berita",
  "menawarkan jasa",
];

export function getTemplates(): TemplateItem[] {
  return Array.from({ length: 1000 }).map((_, index) => {
    const n = index + 1;
    const category = categories[index % categories.length];
    const purpose = purposes[index % purposes.length];

    return {
      id: `tpl-${n}`,
      name: `${category} Template ${String(n).padStart(4, "0")}`,
      category,
      purpose,
      score: 82 + (index % 17),
      sections: ["Hero", "Content", "Feature", "CTA", "Footer"],
    };
  });
}

export function getTemplateById(id: string) {
  return getTemplates().find((item) => item.id === id) ?? getTemplates()[0];
}

export const starterPosts: PostItem[] = [
  {
    id: "p1",
    title: "Panduan Membuat Blog Modern",
    status: "Published",
    score: 94,
    updatedAt: "Hari ini",
    content: "Artikel ini menjelaskan cara membangun blog modern dengan struktur konten yang rapi.",
  },
  {
    id: "p2",
    title: "Strategi Menulis Artikel",
    status: "Draft",
    score: 78,
    updatedAt: "Kemarin",
    content: "Draft ini berisi strategi menulis artikel yang mudah dibaca dan siap dikembangkan.",
  },
  {
    id: "p3",
    title: "Cara Menata Halaman Profil",
    status: "Review",
    score: 87,
    updatedAt: "2 hari lalu",
    content: "Halaman profil perlu menjelaskan identitas, manfaat, kontak, dan bukti kepercayaan.",
  },
];
