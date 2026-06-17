import CompanyPage from "../../components/company/CompanyPage";

export default function AboutPage() {
  return (
    <CompanyPage
      eyebrow="Tentang TriApriyogi"
      title="Kami membangun platform publikasi digital untuk kreator modern."
      description="TriApriyogi Studio dirancang untuk membantu pengguna membuat blog profesional, menulis artikel, mengelola konten, menghubungkan domain, dan memanfaatkan AI dalam satu platform."
      items={[
        "Platform blog modern",
        "Fokus pada kreator dan bisnis",
        "Dashboard mudah digunakan",
        "Dibangun untuk berkembang",
      ]}
    />
  );
}
