export type TemplateItem = {
  id: string;
  name: string;
  category: string;
  layout: string;
  palette: {
    bg: string;
    text: string;
    primary: string;
    soft: string;
    card: string;
  };
};

const categories = [
  "Personal Brand",
  "Business Landing",
  "Online Store",
  "News Portal",
  "Portfolio",
  "Agency",
  "Education",
  "Community",
  "Product Launch",
  "Service Page",
];

const layouts = [
  "Hero Split",
  "Editorial Grid",
  "Storefront",
  "Magazine",
  "Portfolio Wall",
  "SaaS Panel",
  "Course Hub",
  "Community Feed",
  "Product Showcase",
  "Service Stack",
];

const palettes = [
  ["#f8f5ff", "#111827", "#7c3aed", "#ede9fe", "#ffffff"],
  ["#f0f9ff", "#082f49", "#0284c7", "#e0f2fe", "#ffffff"],
  ["#f7fee7", "#1a2e05", "#65a30d", "#ecfccb", "#ffffff"],
  ["#fff7ed", "#431407", "#ea580c", "#ffedd5", "#ffffff"],
  ["#fdf2f8", "#500724", "#db2777", "#fce7f3", "#ffffff"],
  ["#f8fafc", "#0f172a", "#334155", "#e2e8f0", "#ffffff"],
  ["#ecfeff", "#164e63", "#0891b2", "#cffafe", "#ffffff"],
  ["#faf5ff", "#3b0764", "#9333ea", "#f3e8ff", "#ffffff"],
  ["#fefce8", "#422006", "#ca8a04", "#fef9c3", "#ffffff"],
  ["#f5f3ff", "#1e1b4b", "#4f46e5", "#e0e7ff", "#ffffff"],
];

export function makeTemplates(): TemplateItem[] {
  const result: TemplateItem[] = [];

  categories.forEach((category, c) => {
    layouts.forEach((layout, l) => {
      palettes.forEach((palette, p) => {
        result.push({
          id: `tpl-${c + 1}-${l + 1}-${p + 1}`,
          name: `${category} ${layout} ${p + 1}`,
          category,
          layout,
          palette: {
            bg: palette[0],
            text: palette[1],
            primary: palette[2],
            soft: palette[3],
            card: palette[4],
          },
        });
      });
    });
  });

  return result;
}

export const defaultTemplate = makeTemplates()[0];
