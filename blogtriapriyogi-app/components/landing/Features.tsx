const features = [
  {
    icon: "✎",
    title: "Editor Canggih",
    desc: "Rich-text, gambar, media, draft otomatis, revisi artikel, dan jadwal publikasi.",
  },
  {
    icon: "⚡",
    title: "AI Assistant",
    desc: "Generate artikel, rewrite, optimasi SEO, ringkas konten, dan ide headline.",
  },
  {
    icon: "◷",
    title: "Analytics Real-time",
    desc: "Pantau pembaca, post populer, negara, perangkat, referrer, dan performa konten.",
  },
  {
    icon: "🌐",
    title: "Domain Khusus",
    desc: "Subdomain otomatis dan custom domain seperti andibahari.com.",
  },
  {
    icon: "◈",
    title: "Aman & Privat",
    desc: "Role admin dan penulis, proteksi database, whitelist email, dan kontrol akses.",
  },
  {
    icon: "▣",
    title: "Tema Penuh Kontrol",
    desc: "Edit tampilan mobile/desktop, warna, layout, dan backup restore.",
  },
];

export default function Features() {
  return (
    <>
      <section className="sectionIntro" id="features">
        <span>Build and launch</span>
        <h2>Dari ide hingga online, lebih cepat dan lebih rapi.</h2>
        <p>
          Semua kebutuhan blog disatukan dalam dashboard yang mudah digunakan,
          modern, dan siap dikembangkan.
        </p>
      </section>

      <section className="featuresGrid">
        {features.map((item) => (
          <article className="featureCard" key={item.title}>
            <div>{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </section>
    </>
  );
}
