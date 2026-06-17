import CompanyPage from "../../components/company/CompanyPage";

export default function ContactPage() {
  return (
    <CompanyPage
      eyebrow="Kontak"
      title="Hubungi TriApriyogi untuk kerja sama, bantuan, atau kebutuhan platform."
      description="Halaman ini disiapkan untuk kontak bisnis, dukungan pengguna, pertanyaan domain, kerja sama, dan kebutuhan pengembangan platform."
      items={[
        "Dukungan pengguna",
        "Kerja sama bisnis",
        "Pertanyaan domain",
        "Permintaan fitur",
      ]}
    />
  );
}
