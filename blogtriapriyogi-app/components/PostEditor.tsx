"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Tab = "write" | "settings" | "preview";
type EditorMode = "visual" | "text" | "code" | "html" | "json";
type ImageSize = "medium" | "large" | "xlarge" | "full";
type ImageAlign = "left" | "center" | "right";
type ImageAspect =
  | "original"
  | "landscape"
  | "square"
  | "portrait"
  | "feed"
  | "banner";

type ArticleImage = {
  imageIndex: number;
  lineIndex: number;
  alt: string;
  src: string;
  caption: string;
  link: string;
  size: ImageSize;
  align: ImageAlign;
  aspect: ImageAspect;
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function cleanMetaValue(value: string) {
  return String(value || "")
    .replaceAll("{", "")
    .replaceAll("}", "")
    .replaceAll(";", ",")
    .replaceAll("\n", " ")
    .trim();
}

function getVideoEmbedUrl(value: string) {
  const input = String(value || "").trim();

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${encodeURIComponent(match[1])}`;
    }
  }

  if (input.includes("/embed/") && input.startsWith("https://")) {
    return input;
  }

  return "";
}

function parseImageMeta(raw?: string) {
  const meta = {
    size: "large" as ImageSize,
    align: "center" as ImageAlign,
    aspect: "original" as ImageAspect,
    caption: "",
    link: "",
  };

  const value = String(raw || "").trim();

  if (value === "medium" || value === "large" || value === "xlarge" || value === "full") {
    meta.size = value;
    return meta;
  }

  value.split(";").forEach((part) => {
    const [key, ...rest] = part.split("=");
    const cleanKey = key?.trim();
    const cleanValue = rest.join("=").trim();

    if (cleanKey === "size" && ["medium", "large", "xlarge", "full"].includes(cleanValue)) {
      meta.size = cleanValue as ImageSize;
    }

    if (cleanKey === "align" && ["left", "center", "right"].includes(cleanValue)) {
      meta.align = cleanValue as ImageAlign;
    }

    if (
      cleanKey === "aspect" &&
      ["original", "landscape", "square", "portrait", "feed", "banner"].includes(cleanValue)
    ) {
      meta.aspect = cleanValue as ImageAspect;
    }

    if (cleanKey === "caption") meta.caption = cleanValue;
    if (cleanKey === "link") meta.link = cleanValue;
  });

  return meta;
}

function imageMetaToString(data: {
  size: ImageSize;
  align: ImageAlign;
  aspect: ImageAspect;
  caption?: string;
  link?: string;
}) {
  return [
    `size=${data.size}`,
    `align=${data.align}`,
    `aspect=${data.aspect}`,
    `caption=${cleanMetaValue(data.caption || "")}`,
    `link=${cleanMetaValue(data.link || "")}`,
  ].join(";");
}

function parseArticleImages(value: string): ArticleImage[] {
  let imageIndex = 0;

  return String(value || "")
    .split("\n")
    .map((line, lineIndex) => {
      const match = line.trim().match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/);

      if (!match) return null;

      const meta = parseImageMeta(match[3]);

      const item: ArticleImage = {
        imageIndex,
        lineIndex,
        alt: match[1] || "",
        src: match[2] || "",
        caption: meta.caption,
        link: meta.link,
        size: meta.size,
        align: meta.align,
        aspect: meta.aspect,
      };

      imageIndex += 1;
      return item;
    })
    .filter(Boolean) as ArticleImage[];
}

function renderContent(value: string) {
  let imageIndex = 0;

  return String(value || "")
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trim();

      if (line.startsWith("@video ")) {
        const url = line.replace("@video ", "").trim();
        const embedUrl = getVideoEmbedUrl(url);

        if (!embedUrl) return `<p>${escapeHtml(rawLine)}</p>`;

        return `<div class="embed-video"><iframe src="${escapeAttr(embedUrl)}" title="Video artikel" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
      }

      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/);

      if (imageMatch) {
        const currentIndex = imageIndex;
        imageIndex += 1;

        const alt = imageMatch[1] || "Gambar artikel";
        const src = imageMatch[2] || "";
        const meta = parseImageMeta(imageMatch[3]);
        const caption = meta.caption || alt;

        const imageHtml = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`;

        const linkedImage = meta.link
          ? `<a href="${escapeAttr(meta.link)}" target="_blank" rel="noopener noreferrer">${imageHtml}</a>`
          : imageHtml;

        return `<figure class="article-image image-${escapeAttr(meta.size)} align-${escapeAttr(meta.align)} aspect-${escapeAttr(meta.aspect)}" data-image-index="${currentIndex}">${linkedImage}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
      }

      const escaped = escapeHtml(rawLine);

      if (rawLine.startsWith("### ")) return `<h3>${escapeHtml(rawLine.replace("### ", ""))}</h3>`;
      if (rawLine.startsWith("## ")) return `<h2>${escapeHtml(rawLine.replace("## ", ""))}</h2>`;
      if (rawLine.startsWith("> ")) return `<blockquote>${escapeHtml(rawLine.replace("> ", ""))}</blockquote>`;
      if (rawLine.startsWith("- ")) return `<p>• ${escapeHtml(rawLine.replace("- ", ""))}</p>`;
      if (!rawLine.trim()) return "<br />";
      return `<p>${escaped}</p>`;
    })
    .join("");
}



function contentToFriendlyText(value: string) {
  let imageNumber = 0;
  let videoNumber = 0;

  return String(value || "")
    .split("\n")
    .map((line) => {
      const imageMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/);

      if (imageMatch) {
        imageNumber += 1;
        const meta = parseImageMeta(imageMatch[3]);
        const caption = meta.caption || imageMatch[1] || "Gambar artikel";
        return `[[GAMBAR ${imageNumber}: ${caption}]]`;
      }

      if (line.trim().startsWith("@video ")) {
        videoNumber += 1;
        return `[[VIDEO ${videoNumber}]]`;
      }

      return line;
    })
    .join("\n");
}

function friendlyTextToContent(friendly: string, originalContent: string) {
  const mediaLines: string[] = [];

  String(originalContent || "")
    .split("\n")
    .forEach((line) => {
      const clean = line.trim();

      if (
        clean.match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/) ||
        clean.startsWith("@video ")
      ) {
        mediaLines.push(line);
      }
    });

  let mediaIndex = 0;

  return String(friendly || "")
    .split("\n")
    .map((line) => {
      if (line.trim().match(/^\[\[(GAMBAR|VIDEO)\s+\d+.*\]\]$/)) {
        const media = mediaLines[mediaIndex] || "";
        mediaIndex += 1;
        return media;
      }

      return line;
    })
    .join("\n");
}

function htmlToArticleContent(html: string) {
  let next = String(html || "");

  next = next
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");

  next = next.replace(
    /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi,
    (_match, src, alt) => {
      const cleanAlt = cleanMetaValue(alt || "Gambar artikel");
      return `\n\n![${cleanAlt}](${src}){size=large;align=center;aspect=original;caption=${cleanAlt};link=}\n\n`;
    }
  );

  next = next
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "_$1_")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  return next.trim();
}

export default function PostEditor() {
  const router = useRouter();
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [postId, setPostId] = useState("");
  const [email, setEmail] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogName, setBlogName] = useState("");

  const [tab, setTab] = useState<Tab>("write");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("artikel-baru");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [defaultImageSize, setDefaultImageSize] = useState<ImageSize>("large");
  const [defaultImageAspect, setDefaultImageAspect] = useState<ImageAspect>("original");
  const [editorMode, setEditorMode] = useState<EditorMode>("visual");
  const [textDraft, setTextDraft] = useState("");
  const [codeDraft, setCodeDraft] = useState("");
  const [htmlDraft, setHtmlDraft] = useState("");
  const [jsonDraft, setJsonDraft] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [selectedImageAlt, setSelectedImageAlt] = useState("");
  const [selectedImageCaption, setSelectedImageCaption] = useState("");
  const [selectedImageLink, setSelectedImageLink] = useState("");
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>("large");
  const [selectedImageAlign, setSelectedImageAlign] = useState<ImageAlign>("center");
  const [selectedImageAspect, setSelectedImageAspect] = useState<ImageAspect>("original");

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const articleImages = useMemo(() => parseArticleImages(content), [content]);

  const publicUrl = useMemo(() => {
    const activeSlug = makeSlug(slug || title || "artikel-baru");
    const activeSite = blogSlug || "nama-anda";
    return `https://${activeSite}.triapriyogi.com/${activeSlug}.html`;
  }, [blogSlug, slug, title]);

  function articleStateToJson() {
    return JSON.stringify(
      {
        title,
        slug,
        excerpt,
        seoTitle,
        seoDescription,
        content,
        images: articleImages,
      },
      null,
      2
    );
  }

  function switchEditorMode(mode: EditorMode) {
    if (mode === "text") {
      setTextDraft(contentToFriendlyText(content));
    }

    if (mode === "code") {
      setCodeDraft(content);
    }

    if (mode === "html") {
      setHtmlDraft(renderContent(content));
    }

    if (mode === "json") {
      setJsonDraft(articleStateToJson());
    }

    setEditorMode(mode);
    setTab("write");
  }

  function applyTextDraft() {
    setContent(friendlyTextToContent(textDraft, content));
    setEditorMode("visual");
    setMessage("Teks berhasil diterapkan. Gambar tetap tersimpan tanpa menampilkan URL.");
  }

  function applyCodeDraft() {
    setContent(codeDraft);
    setEditorMode("visual");
    setMessage("Kode artikel berhasil diterapkan.");
  }

  function applyHtmlDraft() {
    setContent(htmlToArticleContent(htmlDraft));
    setEditorMode("visual");
    setMessage("HTML berhasil diterapkan ke artikel.");
  }

  function applyJsonDraft() {
    try {
      const parsed = JSON.parse(jsonDraft);

      if (typeof parsed.title === "string") setTitle(parsed.title);
      if (typeof parsed.slug === "string") setSlug(makeSlug(parsed.slug));
      if (typeof parsed.excerpt === "string") setExcerpt(parsed.excerpt);
      if (typeof parsed.seoTitle === "string") setSeoTitle(parsed.seoTitle);
      if (typeof parsed.seoDescription === "string") setSeoDescription(parsed.seoDescription);
      if (typeof parsed.content === "string") setContent(parsed.content);

      setEditorMode("visual");
      setMessage("JSON berhasil diterapkan ke artikel.");
    } catch {
      setMessage("JSON belum valid. Periksa tanda koma, kurung, dan petik.");
    }
  }


  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.replace("https://triapriyogi.com/login");
        return;
      }

      setEmail(data.user.email || "");

      const profile = await supabase
        .from("profiles")
        .select("blog_name, blog_slug")
        .eq("id", data.user.id)
        .single();

      const activeBlogSlug = profile.data?.blog_slug || "";
      const activeBlogName = profile.data?.blog_name || "Platform saya";

      if (!activeBlogSlug) {
        router.replace("/onboarding");
        return;
      }

      setBlogSlug(activeBlogSlug);
      setBlogName(activeBlogName);

      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (id) {
        const post = await supabase
          .from("posts")
          .select("id,title,slug,excerpt,content,seo_title,seo_description,status")
          .eq("id", id)
          .eq("user_id", data.user.id)
          .single();

        if (post.data) {
          setPostId(post.data.id);
          setTitle(post.data.title || "");
          setSlug(post.data.slug || "artikel-baru");
          setExcerpt(post.data.excerpt || "");
          setContent(post.data.content || "");
          setSeoTitle(post.data.seo_title || "");
          setSeoDescription(post.data.seo_description || "");
        }
      }

      setReady(true);
    }

    load();
  }, [router]);

  function updateTitle(value: string) {
    setTitle(value);

    if (!postId && (!slug || slug === "artikel-baru")) {
      setSlug(makeSlug(value) || "artikel-baru");
    }
  }

  function insertText(before: string, after = "") {
    const el = textRef.current;

    if (!el) {
      setContent((current) => `${current}${before}${after}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);

    const next =
      content.slice(0, start) +
      before +
      (selected || "") +
      after +
      content.slice(end);

    setContent(next);

    setTimeout(() => {
      el.focus();
      const cursor = start + before.length + (selected || "").length;
      el.setSelectionRange(cursor, cursor);
    }, 0);
  }

  async function compressImageToWebP(file: File) {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
      image.src = objectUrl;
    });

    const maxWidth = 1600;
    const maxHeight = 1600;

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      throw new Error("Browser tidak mendukung kompres gambar.");
    }

    ctx.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(objectUrl);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.78);
    });

    if (!blob) {
      throw new Error("Gagal mengubah gambar.");
    }

    return new File(
      [blob],
      `${file.name.replace(/\.[^/.]+$/, "") || "gambar"}.webp`,
      { type: "image/webp" }
    );
  }

  async function uploadImage(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      return;
    }

    if (file.type.includes("svg")) {
      setMessage("Format ini belum diaktifkan untuk keamanan. Gunakan JPG, PNG, WebP, atau GIF.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage("Ukuran gambar terlalu besar. Maksimal upload awal 15 MB.");
      return;
    }

    setSaving(true);
    setMessage("Mengoptimalkan gambar...");

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setSaving(false);
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    let optimizedFile: File;

    try {
      optimizedFile = await compressImageToWebP(file);
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Gagal mengoptimalkan gambar.");
      return;
    }

    if (optimizedFile.size > 2 * 1024 * 1024) {
      setSaving(false);
      setMessage("Gambar masih terlalu besar setelah dikompres.");
      return;
    }

    setMessage("Mengunggah gambar...");

    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42);

    const path = `${data.user.id}/${Date.now()}-${safeName || "gambar"}.webp`;

    const uploaded = await supabase.storage
      .from("article-media")
      .upload(path, optimizedFile, {
        cacheControl: "31536000",
        upsert: false,
        contentType: "image/webp",
      });

    if (uploaded.error) {
      setSaving(false);
      setMessage(`Gagal upload gambar: ${uploaded.error.message}`);
      return;
    }

    const publicUrl = supabase.storage
      .from("article-media")
      .getPublicUrl(path).data.publicUrl;

    insertText(
      `\n\n![${safeName || "Gambar artikel"}](${publicUrl}){size=${defaultImageSize};align=center;aspect=${defaultImageAspect};caption=${safeName || "Gambar artikel"};link=}\n\n`
    );

    setSaving(false);
    setTab("write");
    setEditorMode("visual");
    setMessage(`Gambar berhasil masuk. Ukuran akhir: ${Math.round(optimizedFile.size / 1024)} KB.`);
  }

  function insertVideoEmbed() {
    const url = window.prompt("Masukkan link video embed:");

    if (!url) return;

    const embedUrl = getVideoEmbedUrl(url);

    if (!embedUrl) {
      setMessage("Link video belum valid.");
      return;
    }

    insertText(`\n\n@video ${url.trim()}\n\n`);
    setMessage("Video berhasil dimasukkan.");
  }

  function selectImageForEditing(index: number) {
    const image = articleImages.find((item) => item.imageIndex === index);

    if (!image) return;

    setSelectedImageIndex(index);
    setSelectedImageAlt(image.alt);
    setSelectedImageCaption(image.caption);
    setSelectedImageLink(image.link);
    setSelectedImageSize(image.size);
    setSelectedImageAlign(image.align);
    setSelectedImageAspect(image.aspect);
    setTab("preview");
    setMessage("Gambar dipilih. Atur detail gambar di panel kanan.");
  }

  function applyImageSettings() {
    const image = articleImages.find((item) => item.imageIndex === selectedImageIndex);

    if (!image) {
      setMessage("Pilih gambar terlebih dahulu.");
      return;
    }

    const lines = content.split("\n");
    const alt = cleanMetaValue(selectedImageAlt || "Gambar artikel");
    const caption = cleanMetaValue(selectedImageCaption);
    const link = cleanMetaValue(selectedImageLink);

    lines[image.lineIndex] = `![${alt}](${image.src}){${imageMetaToString({
      size: selectedImageSize,
      align: selectedImageAlign,
      aspect: selectedImageAspect,
      caption,
      link,
    })}}`;

    setContent(lines.join("\n"));
    setMessage("Pengaturan gambar berhasil diterapkan.");
  }

  function generateDraft() {
    const activeTitle = title.trim() || "Judul artikel Anda";

    const template = `## Pembuka

Tuliskan pembuka yang menjelaskan masalah utama pembaca dan alasan artikel ini penting.

## Inti pembahasan

- Poin penting pertama
- Poin penting kedua
- Poin penting ketiga

## Langkah praktis

Jelaskan langkah-langkah yang mudah diikuti oleh pembaca.

## Kesimpulan

Tutup artikel dengan ringkasan singkat dan ajakan untuk mengambil tindakan berikutnya.`;

    setTitle(activeTitle);
    setSlug(makeSlug(activeTitle));
    setExcerpt(
      excerpt ||
        `${activeTitle} membahas poin penting secara ringkas, jelas, dan mudah dipahami.`
    );
    setSeoTitle(seoTitle || activeTitle);
    setSeoDescription(
      seoDescription ||
        `${activeTitle} - panduan ringkas dan profesional untuk pembaca.`
    );
    setContent(content ? `${content}\n\n${template}` : template);
    setMessage("Kerangka artikel berhasil dibuat.");
  }

  async function savePost(nextStatus: "draft" | "published") {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.replace("https://triapriyogi.com/login");
      return;
    }

    const cleanTitle = title.trim() || "Untitled";
    let cleanSlug = makeSlug(slug || cleanTitle || "artikel-baru");

    if (!cleanSlug) cleanSlug = "artikel-baru";

    setSaving(true);
    setMessage("");

    let check = supabase
      .from("posts")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("slug", cleanSlug);

    if (postId) {
      check = check.neq("id", postId);
    }

    const taken = await check.maybeSingle();

    if (taken.data?.id) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-5)}`;
    }

    const payload = {
      user_id: data.user.id,
      title: cleanTitle,
      slug: cleanSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      status: nextStatus,
      seo_title: seoTitle.trim() || cleanTitle,
      seo_description: seoDescription.trim() || excerpt.trim(),
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (postId) {
      const result = await supabase
        .from("posts")
        .update(payload)
        .eq("id", postId)
        .eq("user_id", data.user.id)
        .select("id")
        .single();

      if (result.error) {
        setMessage(`Gagal menyimpan artikel: ${result.error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const result = await supabase
        .from("posts")
        .insert(payload)
        .select("id")
        .single();

      if (result.error) {
        setMessage(`Gagal membuat artikel baru: ${result.error.message}`);
        setSaving(false);
        return;
      }

      setPostId(result.data.id);
      router.replace(`/editor?id=${result.data.id}`);
    }

    setSlug(cleanSlug);
    setSaving(false);
    setMessage(
      nextStatus === "published"
        ? "Artikel berhasil dipublikasikan."
        : "Draft berhasil disimpan."
    );
  }

  if (!ready) {
    return (
      <main className="editor-shell">
        <div className="editor-loading">Menyiapkan editor...</div>
      </main>
    );
  }

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <button className="editor-menu" onClick={() => router.push("/")}>
          ☰
        </button>

        <div>
          <b>Editor post</b>
          <span>{email}</span>
        </div>

        <div className="editor-actions">
          <button onClick={generateDraft}>✦ Asisten tulisan</button>
          <button onClick={() => savePost("draft")} disabled={saving}>
            💾 Simpan draft
          </button>
          <button className="publish" onClick={() => savePost("published")} disabled={saving}>
            ✈ Publikasi
          </button>
        </div>
      </header>

      <section className="editor-canvas">
        <div className="editor-card">
          <div className="editor-tabs">
            <button className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>
              Tulis
            </button>
            <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
              Pengaturan
            </button>
            <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
              Preview
            </button>
          </div>

          {tab === "write" && (
            <>
              <input
                className="editor-title"
                value={title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Judul artikel..."
              />

              <div className="editor-meta">
                <span>{wordCount} kata</span>
                <span>{readTime} menit baca</span>
                <span>Slug: /{makeSlug(slug || title || "artikel-baru")}</span>
              </div>

              <div className="editor-toolbar">
                <button onClick={() => insertText("\n\n## ", "\n")}>H₂</button>
                <button onClick={() => insertText("\n\n### ", "\n")}>H₃</button>
                <button onClick={() => insertText("**", "**")}>B</button>
                <button onClick={() => insertText("_", "_")}>I</button>
                <button onClick={() => insertText("[teks link](https://contoh.com)")}>🔗</button>
                <button onClick={() => insertText("\n- ")}>☷</button>
                <button onClick={() => insertText("\n> ")}>❝</button>

                <select
                  className="editor-image-size"
                  value={defaultImageSize}
                  onChange={(e) => setDefaultImageSize(e.target.value as ImageSize)}
                  title="Ukuran gambar"
                >
                  <option value="medium">Sedang</option>
                  <option value="large">Besar</option>
                  <option value="xlarge">Extra besar</option>
                  <option value="full">Full lebar</option>
                </select>

                <select
                  className="editor-image-aspect"
                  value={defaultImageAspect}
                  onChange={(e) => setDefaultImageAspect(e.target.value as ImageAspect)}
                  title="Bentuk gambar"
                >
                  <option value="original">Original</option>
                  <option value="landscape">Lanskap 16:9</option>
                  <option value="square">Kotak 1:1</option>
                  <option value="feed">Feed 4:5</option>
                  <option value="portrait">Potret 9:16</option>
                  <option value="banner">Banner 1.91:1</option>
                </select>

                <button onClick={() => fileRef.current?.click()}>▧ Gambar</button>
                <button onClick={insertVideoEmbed}>▶ Video</button>
                <button onClick={() => setTab("preview")}>⚙️ Atur</button>
                <button className="ai" onClick={generateDraft}>✦ Draft cepat</button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.currentTarget.value = "";
                }}
              />

              <div className="editor-mode-tabs">
                <button
                  className={editorMode === "visual" ? "active" : ""}
                  onClick={() => switchEditorMode("visual")}
                  type="button"
                >
                  Visual
                </button>
                <button
                  className={editorMode === "text" ? "active" : ""}
                  onClick={() => switchEditorMode("text")}
                  type="button"
                >
                  Teks
                </button>
                <button
                  className={editorMode === "code" ? "active" : ""}
                  onClick={() => switchEditorMode("code")}
                  type="button"
                >
                  Kode
                </button>
                <button
                  className={editorMode === "html" ? "active" : ""}
                  onClick={() => switchEditorMode("html")}
                  type="button"
                >
                  HTML
                </button>
                <button
                  className={editorMode === "json" ? "active" : ""}
                  onClick={() => switchEditorMode("json")}
                  type="button"
                >
                  JSON
                </button>
              </div>

              {editorMode === "visual" && (
                <section
                  className="editor-visual-draft visual-only"
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    const item = target.closest("[data-image-index]") as HTMLElement | null;

                    if (!item) return;

                    const index = Number(item.dataset.imageIndex || "-1");

                    if (index >= 0) {
                      selectImageForEditing(index);
                    }
                  }}
                >
                  <small>Tampilan artikel</small>
                  <h1>{title || "Judul artikel"}</h1>
                  <p>{excerpt || "Ringkasan artikel akan tampil di sini."}</p>

                  {content.trim() ? (
                    <div dangerouslySetInnerHTML={{ __html: renderContent(content) }} />
                  ) : (
                    <div className="visual-empty">
                      Mulai menulis dari mode Teks, atau gunakan tombol gambar/video di toolbar.
                    </div>
                  )}
                </section>
              )}

              {editorMode === "text" && (
                <section className="editor-source-draft clean-text-editor">
                  <div className="source-head">
                    <div>
                      <b>Teks artikel</b>
                      <span>Mode nyaman untuk menulis. Gambar disimpan sebagai kartu, URL tidak ditampilkan.</span>
                    </div>
                    <button type="button" onClick={applyTextDraft}>
                      Terapkan teks
                    </button>
                  </div>

                  <textarea
                    ref={textRef}
                    className="editor-body clean-text-mode"
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    placeholder="Tulis isi artikel di sini. Gambar akan tampil sebagai kartu [[GAMBAR 1: ...]], bukan URL."
                  />

                  <div className="clean-text-help">
                    <b>Catatan:</b>
                    <span>
                      Kartu gambar dan video bisa dipindah posisinya di teks. Untuk mengubah caption, link, ukuran,
                      posisi, dan bentuk gambar, klik gambar di mode Visual.
                    </span>
                  </div>
                </section>
              )}

              {editorMode === "code" && (
                <section className="editor-source-draft">
                  <div className="source-head">
                    <div>
                      <b>Kode sumber</b>
                      <span>Mode ahli. URL gambar, video, dan pengaturan media tampil di sini.</span>
                    </div>
                    <button type="button" onClick={applyCodeDraft}>
                      Terapkan kode
                    </button>
                  </div>

                  <textarea
                    className="editor-body code-mode"
                    value={codeDraft}
                    onChange={(e) => setCodeDraft(e.target.value)}
                    placeholder="Kode sumber artikel akan tampil di sini."
                  />
                </section>
              )}

              {editorMode === "html" && (
                <section className="editor-source-draft">
                  <div className="source-head">
                    <div>
                      <b>HTML</b>
                      <span>Untuk pengguna ahli. Kode berbahaya akan dibersihkan.</span>
                    </div>
                    <button type="button" onClick={applyHtmlDraft}>
                      Terapkan HTML
                    </button>
                  </div>

                  <textarea
                    className="editor-body code-mode"
                    value={htmlDraft}
                    onChange={(e) => setHtmlDraft(e.target.value)}
                    placeholder="<h2>Subjudul</h2><p>Isi artikel...</p>"
                  />
                </section>
              )}

              {editorMode === "json" && (
                <section className="editor-source-draft">
                  <div className="source-head">
                    <div>
                      <b>JSON</b>
                      <span>Untuk struktur artikel, SEO, metadata, dan konten.</span>
                    </div>
                    <button type="button" onClick={applyJsonDraft}>
                      Terapkan JSON
                    </button>
                  </div>

                  <textarea
                    className="editor-body code-mode"
                    value={jsonDraft}
                    onChange={(e) => setJsonDraft(e.target.value)}
                    placeholder='{"title":"Judul artikel","content":"Isi artikel"}'
                  />
                </section>
              )}

            </>
          )}

          {tab === "settings" && (
            <div className="editor-settings">
              <label>
                Slug URL
                <input
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="artikel-baru"
                />
              </label>

              <label>
                Ringkasan artikel
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Tulis ringkasan pendek untuk artikel ini."
                />
              </label>

              <label>
                Judul SEO
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Judul untuk mesin pencari"
                />
              </label>

              <label>
                Deskripsi SEO
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Deskripsi singkat untuk mesin pencari."
                />
              </label>
            </div>
          )}

          {tab === "preview" && (
            <article
              className="editor-preview"
              onClick={(event) => {
                const target = event.target as HTMLElement;
                const item = target.closest("[data-image-index]") as HTMLElement | null;

                if (!item) return;

                const index = Number(item.dataset.imageIndex || "-1");

                if (index >= 0) {
                  selectImageForEditing(index);
                }
              }}
            >
              <small>{blogName}</small>
              <h1>{title || "Judul artikel"}</h1>
              <p>{excerpt || "Ringkasan artikel akan tampil di sini."}</p>
              <div dangerouslySetInnerHTML={{ __html: renderContent(content) }} />
            </article>
          )}
        </div>

        <aside className="editor-side">
          {message && <div className="editor-message">{message}</div>}

          <div className="editor-panel image-tools-panel">
            <p>Pengaturan gambar</p>

            {articleImages.length === 0 ? (
              <span className="image-tools-empty">
                Belum ada gambar. Klik tombol Gambar di toolbar untuk upload.
              </span>
            ) : (
              <div className="image-list">
                {articleImages.map((image) => (
                  <button
                    key={`${image.lineIndex}-${image.src}`}
                    className={selectedImageIndex === image.imageIndex ? "active" : ""}
                    onClick={() => selectImageForEditing(image.imageIndex)}
                  >
                    <img src={image.src} alt={image.alt || "Gambar"} />
                    <span>
                      <b>{image.alt || "Gambar artikel"}</b>
                      <small>
                        {image.size} · {image.aspect}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedImageIndex >= 0 && (
              <div className="editor-image-editor-panel">
                <label>
                  Masukkan link
                  <input
                    value={selectedImageLink}
                    onChange={(e) => setSelectedImageLink(e.target.value)}
                    placeholder="https://contoh.com atau kosongkan"
                  />
                </label>

                <label>
                  Alt text
                  <input
                    value={selectedImageAlt}
                    onChange={(e) => setSelectedImageAlt(e.target.value)}
                    placeholder="Deskripsi gambar untuk aksesibilitas"
                  />
                </label>

                <label>
                  Teks gambar
                  <textarea
                    value={selectedImageCaption}
                    onChange={(e) => setSelectedImageCaption(e.target.value)}
                    placeholder="Caption yang tampil di bawah gambar"
                  />
                </label>

                <div className="image-settings-grid">
                  <label>
                    Ukuran
                    <select
                      value={selectedImageSize}
                      onChange={(e) => setSelectedImageSize(e.target.value as ImageSize)}
                    >
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                      <option value="xlarge">Extra besar</option>
                      <option value="full">Full lebar</option>
                    </select>
                  </label>

                  <label>
                    Posisi
                    <select
                      value={selectedImageAlign}
                      onChange={(e) => setSelectedImageAlign(e.target.value as ImageAlign)}
                    >
                      <option value="center">Tengah</option>
                      <option value="left">Kiri</option>
                      <option value="right">Kanan</option>
                    </select>
                  </label>

                  <label>
                    Bentuk
                    <select
                      value={selectedImageAspect}
                      onChange={(e) => setSelectedImageAspect(e.target.value as ImageAspect)}
                    >
                      <option value="original">Original</option>
                      <option value="landscape">Lanskap 16:9</option>
                      <option value="square">Kotak 1:1</option>
                      <option value="feed">Feed 4:5</option>
                      <option value="portrait">Potret 9:16</option>
                      <option value="banner">Banner 1.91:1</option>
                    </select>
                  </label>
                </div>

                <button onClick={applyImageSettings}>
                  ⚙️ Terapkan ke gambar
                </button>
              </div>
            )}
          </div>

          <div className="editor-panel">
            <p>Publikasi</p>
            <button onClick={() => savePost("draft")} disabled={saving}>
              💾 Simpan draft
            </button>
            <button className="publish" onClick={() => savePost("published")} disabled={saving}>
              ✈ Publikasikan artikel
            </button>
          </div>

          <div className="editor-panel">
            <p>Kualitas artikel</p>

            <div className={title.trim() ? "ok" : "warn"}>
              Judul {title.trim() ? "siap" : "belum diisi"}
            </div>

            <div className={excerpt.trim() ? "ok" : "warn"}>
              Ringkasan {excerpt.trim() ? "siap" : "belum diisi"}
            </div>

            <div className={content.trim().length > 120 ? "ok" : "warn"}>
              Isi artikel {content.trim().length > 120 ? "cukup" : "masih pendek"}
            </div>

            <div className={seoTitle.trim() && seoDescription.trim() ? "ok" : "warn"}>
              SEO {seoTitle.trim() && seoDescription.trim() ? "siap" : "belum lengkap"}
            </div>
          </div>

          <div className="editor-panel dark">
            <p>Asisten tulisan</p>
            <h2>Buat draft lebih cepat.</h2>
            <span>
              Bantu membuat outline, pembuka, ringkasan, dan deskripsi artikel.
            </span>
            <button onClick={generateDraft}>✦ Buat draft awal</button>
          </div>

          <div className="editor-panel">
            <p>Detail URL</p>
            <b>{publicUrl}</b>
            <a href={publicUrl} target="_blank">
              Buka artikel publik
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
