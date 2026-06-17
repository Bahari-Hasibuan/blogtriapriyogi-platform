export default function AIStudio() {
  return (
    <section className="aiSection" id="ai">
      <div className="aiText">
        <span>AI Studio</span>
        <h2>Mulailah menulis dengan asisten cerdas.</h2>
        <p>
          AI membantu membuat artikel dari ide mentah menjadi draft yang siap
          diedit. Cocok untuk blogger, kreator, bisnis kecil, dan personal brand.
        </p>
        <a className="whiteButton" href="#pricing">Aktifkan AI</a>
      </div>

      <div className="editorMockup">
        <div className="editorTop">
          <b>Editor post</b>
          <button>Simpan draft</button>
          <button className="publish">Publikasi</button>
        </div>

        <h3>Untitled</h3>

        <div className="toolbar">
          <span>Normal</span>
          <span>HTML</span>
          <span>JSON</span>
          <span>View</span>
          <span>B</span>
          <span>I</span>
          <span>Link</span>
          <button>Generate AI</button>
        </div>

        <div className="paper">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </section>
  );
}
