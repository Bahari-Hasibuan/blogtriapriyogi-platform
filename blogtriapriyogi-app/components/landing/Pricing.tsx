const plans = [
  {
    name: "Gratis",
    desc: "Untuk mulai mencoba blog pribadi.",
    price: "Rp0",
    items: ["10 postingan", "Subdomain gratis", "Basic analytics", "Watermark platform"],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Pro",
    desc: "Untuk kreator yang ingin terlihat profesional.",
    price: "Rp59K",
    items: ["Postingan tak terbatas", "Custom domain", "AI Assistant", "Analytics lengkap"],
    cta: "Pilih Pro",
    popular: true,
  },
  {
    name: "Bisnis",
    desc: "Untuk tim, brand, dan bisnis konten.",
    price: "Rp149K",
    items: ["Multi user", "Role admin/penulis", "Prioritas support", "Integrasi API"],
    cta: "Hubungi Kami",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="sectionIntro compact">
        <span>Harga</span>
        <h2>Pilih paket sesuai kebutuhan.</h2>
      </div>

      <div className="priceGrid">
        {plans.map((plan) => (
          <article className={plan.popular ? "priceCard highlight" : "priceCard"} key={plan.name}>
            {plan.popular && <div className="popular">Paling populer</div>}
            <h3>{plan.name}</h3>
            <p>{plan.desc}</p>
            <strong>{plan.price}</strong>

            <ul>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <a href="#">{plan.cta}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
