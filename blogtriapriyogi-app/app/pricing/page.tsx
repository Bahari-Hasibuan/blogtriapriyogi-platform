import CompanyPage from "../../components/company/CompanyPage";

export default function PricingPage() {
  return (
    <CompanyPage
      eyebrow="Harga"
      title="Paket fleksibel untuk mulai gratis dan berkembang ke level profesional."
      description="Mulai dari paket gratis untuk mencoba, paket Pro untuk kreator serius, dan paket Bisnis untuk tim atau brand yang membutuhkan kontrol lebih besar."
      items={[
        "Gratis: mulai membuat blog",
        "Pro: custom domain dan AI",
        "Bisnis: multi user dan prioritas",
        "Enterprise: kebutuhan skala besar",
      ]}
      cta="Mulai dari Beranda"
    />
  );
}
