export default function FAQ() {
  return (
    <section className="faq" id="faq">
      <div>
        <span>FAQ</span>
        <h2>Pertanyaan yang sering diajukan.</h2>
      </div>

      <div className="faqList">
        <details>
          <summary>Apakah bisa pakai domain sendiri?</summary>
          <p>Bisa. Blog pengguna dapat diarahkan ke domain pribadi seperti andibahari.com.</p>
        </details>

        <details>
          <summary>Apakah ada AI untuk menulis artikel?</summary>
          <p>Ada. AI Assistant membantu membuat ide, outline, rewrite, dan draft artikel.</p>
        </details>

        <details>
          <summary>Apakah cocok untuk bisnis?</summary>
          <p>Cocok untuk personal brand, kreator, UMKM, studio, dan bisnis konten.</p>
        </details>
      </div>
    </section>
  );
}
