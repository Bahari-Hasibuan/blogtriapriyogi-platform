export default function Hero() {
  return (
    <section className="hero">
      <div className="domainSearch">
        <div className="domainInput">
          <span>⌕</span>
          <input placeholder="Cari domain atau subdomain blog Anda..." />
        </div>
        <button>Cari Domain</button>
        <p>Domain kustom untuk pengguna premium</p>
      </div>

      <div className="heroInner">
        <div className="heroText">
          <div className="badge">⚡ Edisi 2026 · Didukung AI</div>

          <h1>
            Blog profesional,
            <span> tanpa rumit.</span>
          </h1>

          <p>
            Bangun blog modern dengan dashboard pengguna, editor artikel,
            analytics real-time, AI Assistant, subdomain otomatis, dan domain
            kustom dalam satu platform.
          </p>

          <div className="heroActions">
            <a className="solidButton" href="#pricing">Mulai Gratis</a>
            <a className="whiteButton" href="#features">Lihat Fitur</a>
          </div>

          <div className="trustLine">
            <span>Gratis selamanya</span>
            <span>Tanpa kartu kredit</span>
            <span>Upgrade kapan saja</span>
          </div>
        </div>

        <div className="heroVisual">
          <div className="browserMockup">
            <div className="browserTop">
              <span></span>
              <span></span>
              <span></span>
              <p>triapriyogi.com/dashboard</p>
            </div>

            <div className="dashboardMockup">
              <aside>
                <div className="sideLogo"></div>
                <b>TriBlog</b>
                <a>Dashboard</a>
                <a>Postingan</a>
                <a>Media</a>
                <a>Analytics</a>
                <a>AI Tools</a>
              </aside>

              <section>
                <div className="dashHeader">
                  <div>
                    <h3>Selamat datang kembali</h3>
                    <p>Ringkasan blog dan aktivitas terbaru Anda.</p>
                  </div>
                  <button>+ Post baru</button>
                </div>

                <div className="statsGrid">
                  <div>
                    <small>Total post</small>
                    <strong>24</strong>
                  </div>
                  <div>
                    <small>Kunjungan</small>
                    <strong>12.8K</strong>
                  </div>
                  <div>
                    <small>Dipublikasi</small>
                    <strong>18</strong>
                  </div>
                  <div>
                    <small>Draft</small>
                    <strong>6</strong>
                  </div>
                </div>

                <div className="postPanel">
                  <div className="postPanelTop">
                    <b>Post terbaru</b>
                    <small>Lihat semua →</small>
                  </div>

                  <div className="postItem">
                    <span></span>
                    <p>Strategi konten blog 2026</p>
                    <em>published</em>
                  </div>

                  <div className="postItem">
                    <span></span>
                    <p>Panduan SEO untuk pemula</p>
                    <em>draft</em>
                  </div>

                  <div className="postItem">
                    <span></span>
                    <p>Membangun personal brand</p>
                    <em>published</em>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="floatingCard aiFloat">
            <b>AI Assistant</b>
            <p>Generate artikel, rewrite, SEO, image idea.</p>
          </div>

          <div className="floatingCard domainFloat">
            <b>andibahari.com</b>
            <p>Domain aktif</p>
          </div>
        </div>
      </div>
    </section>
  );
}
