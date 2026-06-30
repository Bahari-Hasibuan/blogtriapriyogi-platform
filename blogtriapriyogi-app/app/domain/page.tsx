import Link from "next/link"
import styles from "./domain-premium.module.css"

const dnsRecords = [
  {
    label: "Verifikasi kepemilikan",
    type: "TXT",
    name: "_triapriyogi",
    value: "triapriyogi-verify=45f35077e47e1f2b5b58746b6ec26",
    status: "Menunggu DNS",
  },
  {
    label: "Arahkan subdomain",
    type: "CNAME",
    name: "blog",
    value: "connect.triapriyogi.com",
    status: "Siap diarahkan",
  },
  {
    label: "Root domain",
    type: "A",
    name: "@",
    value: "76.76.21.21",
    status: "Opsional",
  },
]

const domainList = [
  {
    name: "vlog-blog.triapriyogi.com",
    type: "Alamat bawaan",
    status: "Aktif",
  },
  {
    name: "triapriyogi.web.id",
    type: "Domain pribadi",
    status: "Perlu verifikasi",
  },
]

export default function DomainPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Domain center</span>
          <h1>Atur alamat publik blog dengan tampilan profesional.</h1>
          <p>
            Kelola subdomain, domain pribadi, status DNS, dan verifikasi kepemilikan dalam satu halaman yang bersih, luas, dan mudah dipahami.
          </p>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.cardTop}>
            <span />
            <span />
            <span />
          </div>

          <small>Alamat aktif</small>
          <strong>vlog-blog.triapriyogi.com</strong>
          <p>Halaman publik sudah aktif dan siap dikunjungi pembaca.</p>

          <div className={styles.statusPill}>Online</div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Alamat bawaan</span>
            <h2>Nama blog</h2>
            <p>Gunakan nama singkat agar alamat mudah dibaca dan mudah diingat.</p>
          </div>

          <label className={styles.label}>Slug alamat</label>
          <div className={styles.inputGroup}>
            <input defaultValue="vlog-blog" aria-label="Slug alamat" />
            <span>.triapriyogi.com</span>
          </div>

          <div className={styles.previewBox}>
            <small>Preview alamat publik</small>
            <strong>https://vlog-blog.triapriyogi.com</strong>
          </div>

          <button className={styles.primaryButton}>Simpan alamat</button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Domain pribadi</span>
            <h2>Hubungkan domain sendiri</h2>
            <p>Masukkan domain yang sudah Anda beli dari provider domain.</p>
          </div>

          <label className={styles.label}>Nama domain</label>
          <input className={styles.input} placeholder="contoh: namabrand.com" aria-label="Nama domain" />

          <div className={styles.serverBox}>
            <div>
              <small>Root domain</small>
              <strong>A → 76.76.21.21</strong>
            </div>
            <div>
              <small>Subdomain</small>
              <strong>CNAME → connect.triapriyogi.com</strong>
            </div>
          </div>

          <button className={styles.darkButton}>Tambah domain pribadi</button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>Domain tersimpan</span>
          <h2>Status domain</h2>
          <p>Pantau alamat bawaan, domain pribadi, dan status verifikasi.</p>
        </div>

        <div className={styles.domainRows}>
          {domainList.map((item) => (
            <article className={styles.domainRow} key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.type}</small>
              </div>

              <span className={item.status === "Aktif" ? styles.activeBadge : styles.pendingBadge}>
                {item.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>Verifikasi DNS</span>
          <h2>Record yang perlu dipasang</h2>
          <p>Salin record berikut ke DNS provider, lalu klik cek DNS setelah propagasi berjalan.</p>
        </div>

        <div className={styles.dnsGrid}>
          {dnsRecords.map((record) => (
            <article className={styles.dnsCard} key={record.label}>
              <div className={styles.dnsHead}>
                <span>{record.label}</span>
                <strong>{record.type}</strong>
              </div>

              <div className={styles.recordBox}>
                <small>Name</small>
                <code>{record.name}</code>
              </div>

              <div className={styles.recordBox}>
                <small>Value</small>
                <code>{record.value}</code>
              </div>

              <div className={styles.cardFooter}>
                <span>{record.status}</span>
                <button>Cek DNS</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bottomCta}>
        <div>
          <span>Siap dipakai</span>
          <h2>Domain rapi membuat blog terlihat lebih serius.</h2>
          <p>Gunakan alamat singkat, aktifkan SSL, dan hubungkan ke workspace studio Anda.</p>
        </div>

        <Link href="/studio" className={styles.primaryButton}>
          Kembali ke studio
        </Link>
      </section>
    </main>
  )
}
