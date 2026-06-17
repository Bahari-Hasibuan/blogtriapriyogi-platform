import CompanyPage from "../../components/company/CompanyPage";

export default function SecurityPage() {
  return (
    <CompanyPage
      eyebrow="Security"
      title="Keamanan, privasi, dan keandalan menjadi fondasi platform."
      description="TriApriyogi akan dikembangkan dengan prinsip keamanan data, kontrol akses, backup, audit, perlindungan domain, dan monitoring agar siap menjadi platform yang tahan lama."
      items={[
        "Kontrol akses pengguna",
        "Proteksi data dan akun",
        "Monitoring deployment",
        "Rencana backup dan rollback",
      ]}
    />
  );
}
