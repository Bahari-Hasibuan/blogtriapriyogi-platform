"use client";

import { useEffect, useState } from "react";
import { getTemplateById, type PostItem } from "./data";

export function TemplatePreview({ id }: { id: string }) {
  const template = getTemplateById(id);

  return (
    <PreviewShell title={template.name} subtitle={`${template.category} · ${template.purpose}`}>
      <section style={hero}>
        <span style={pill}>Live Preview</span>
        <h1 style={title}>{template.name}</h1>
        <p style={text}>Template ini siap dikembangkan untuk {template.purpose}. Struktur halaman sudah mencakup hero, konten, fitur, ajakan bertindak, dan footer.</p>
        <button style={button}>Gunakan Template</button>
      </section>

      <section style={grid}>
        {template.sections.map((item) => (
          <article style={card} key={item}>
            <h2>{item}</h2>
            <p>Blok {item.toLowerCase()} untuk mempercepat pembuatan halaman.</p>
          </article>
        ))}
      </section>
    </PreviewShell>
  );
}

export function PostPreview({ id }: { id: string }) {
  const [post, setPost] = useState<PostItem | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(`studio28.preview.${id}`);
    if (saved) setPost(JSON.parse(saved));
  }, [id]);

  return (
    <PreviewShell title={post?.title ?? "Preview Post"} subtitle={post?.status ?? "Draft"}>
      <article style={article}>
        <span style={pill}>Post Preview</span>
        <h1 style={title}>{post?.title ?? "Konten tidak ditemukan"}</h1>
        <p style={text}>{post?.content ?? "Buka preview dari menu Content Library agar data post terbaca."}</p>
      </article>
    </PreviewShell>
  );
}

function PreviewShell(props: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main style={page}>
      <nav style={nav}>
        <strong>TA Studio Preview</strong>
        <span>{props.subtitle}</span>
      </nav>
      {props.children}
    </main>
  );
}

const page = {
  minHeight: "100vh",
  padding: "32px min(6vw, 72px)",
  background: "linear-gradient(135deg,#f8f6ff,#eef8ff)",
  fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
  color: "#111827",
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  marginBottom: 32,
};

const hero = {
  borderRadius: 36,
  padding: "54px min(6vw,72px)",
  background: "radial-gradient(circle at top right,rgba(124,58,237,.35),transparent 35%),linear-gradient(135deg,#0b071f,#3b168d)",
  color: "#fff",
  boxShadow: "0 30px 90px rgba(30,20,90,.25)",
};

const article = {
  borderRadius: 36,
  padding: "54px min(6vw,72px)",
  background: "#fff",
  boxShadow: "0 30px 90px rgba(30,20,90,.12)",
};

const pill = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.16)",
  marginBottom: 18,
};

const title = {
  fontSize: "clamp(44px,7vw,88px)",
  lineHeight: .92,
  letterSpacing: "-.075em",
  margin: 0,
};

const text = {
  fontSize: 18,
  lineHeight: 1.9,
  maxWidth: 760,
  marginTop: 22,
};

const button = {
  marginTop: 28,
  border: 0,
  borderRadius: 999,
  padding: "15px 22px",
  fontWeight: 900,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 18,
  marginTop: 28,
};

const card = {
  background: "#fff",
  borderRadius: 28,
  padding: 26,
  boxShadow: "0 24px 70px rgba(25,18,60,.08)",
};
