import { Cards, Panel, Stats, StudioShell } from "@/components/studio/StudioShell";

export default function Page() {
  return (
    <StudioShell
      active="analytics"
      title="Growth Analytics."
      description="Pantau views, CTR, durasi baca, konten terbaik, dan peluang optimasi."
    >
      <Stats />
      <Panel title="Insight">
        <Cards items={[
          { title: "Top Content", text: "Artikel panduan memberi trafik tertinggi." },
          { title: "SEO Gap", text: "Beberapa halaman perlu meta description." },
          { title: "Growth", text: "Kunjungan naik dari bulan sebelumnya." },
        ]} />
      </Panel>
    </StudioShell>
  );
}
