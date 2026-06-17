import CompanyPage from "../../components/company/CompanyPage";

export default function StatusPage() {
  return (
    <CompanyPage
      eyebrow="Status Sistem"
      title="Pantau kesehatan layanan TriApriyogi secara transparan."
      description="Halaman status akan digunakan untuk menampilkan kondisi platform, deployment, API, database, autentikasi, dan fitur penting lainnya."
      items={[
        "Website utama aktif",
        "Dashboard aktif",
        "Editor aktif",
        "Monitoring disiapkan",
      ]}
    />
  );
}
