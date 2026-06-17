import CompanyPage from "../../components/company/CompanyPage";

export default function DocsPage() {
  return (
    <CompanyPage
      eyebrow="Dokumentasi"
      title="Panduan penggunaan platform untuk pengguna, kreator, dan admin."
      description="Dokumentasi akan berisi panduan membuat blog, menulis artikel, mengatur domain, memakai AI Assistant, membaca analytics, dan mengelola akun."
      items={[
        "Panduan membuat blog",
        "Panduan editor artikel",
        "Panduan custom domain",
        "Panduan AI Assistant",
      ]}
    />
  );
}
