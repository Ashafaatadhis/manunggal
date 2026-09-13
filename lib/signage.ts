export const SIGNAGE_TEMPLATES = {
  A4: {
    label: "A4",
    className: "aspect-[210/297] max-w-[420px]",
    description: "Untuk meja registrasi atau poster utama",
  },
  A5: {
    label: "A5",
    className: "aspect-[148/210] max-w-[340px]",
    description: "Ukuran ringkas untuk meja tamu",
  },
  SQUARE: {
    label: "Square",
    className: "aspect-square max-w-[360px]",
    description: "Cocok untuk frame dan media sosial",
  },
} as const;

export type SignageTemplate = keyof typeof SIGNAGE_TEMPLATES;

export const QR_THEMES = {
  floral: {
    label: "Floral",
    description: "Lembut, hangat, dan romantis",
    dark: "#111827",
    light: "#ffffff",
    previewClass: "border-slate-200 bg-white",
    accentClass: "bg-[#f5d8e2] text-[#7c3f58]",
    patternClass: "bg-[radial-gradient(circle_at_12%_12%,rgba(232,185,201,0.32)_0_2px,transparent_3px),radial-gradient(circle_at_88%_84%,rgba(124,63,88,0.12)_0_2px,transparent_3px)]",
  },
  birthday: {
    label: "Birthday",
    description: "Ceria untuk pesta ulang tahun",
    dark: "#111827",
    light: "#ffffff",
    previewClass: "border-slate-200 bg-white",
    accentClass: "bg-[#d8effc] text-[#244b75]",
    patternClass: "bg-[radial-gradient(circle_at_10%_18%,rgba(169,215,242,0.45)_0_2px,transparent_3px),radial-gradient(circle_at_90%_78%,rgba(244,190,111,0.3)_0_2px,transparent_3px)]",
  },
  // Legacy values stay readable for saved events created before theme presets.
  ink: {
    label: "Floral",
    description: "Lembut, hangat, dan romantis",
    dark: "#111827",
    light: "#ffffff",
    previewClass: "border-slate-200 bg-white",
    accentClass: "bg-[#f5d8e2] text-[#7c3f58]",
    patternClass: "bg-[radial-gradient(circle_at_12%_12%,rgba(232,185,201,0.32)_0_2px,transparent_3px)]",
  },
  blush: {
    label: "Floral",
    description: "Lembut, hangat, dan romantis",
    dark: "#111827",
    light: "#ffffff",
    previewClass: "border-slate-200 bg-white",
    accentClass: "bg-[#f5d8e2] text-[#7c3f58]",
    patternClass: "bg-[radial-gradient(circle_at_12%_12%,rgba(232,185,201,0.32)_0_2px,transparent_3px)]",
  },
  forest: {
    label: "Birthday",
    description: "Ceria untuk pesta ulang tahun",
    dark: "#111827",
    light: "#ffffff",
    previewClass: "border-slate-200 bg-white",
    accentClass: "bg-[#d8effc] text-[#244b75]",
    patternClass: "bg-[radial-gradient(circle_at_10%_18%,rgba(169,215,242,0.45)_0_2px,transparent_3px)]",
  },
} as const;

export type QrTheme = keyof typeof QR_THEMES;
export const QR_COLOR_PRESETS = QR_THEMES;
export type QrColorPreset = QrTheme;

export const EVENT_SIGNAGE_COPY: Record<
  "wedding" | "birthday" | "graduation" | "corporate" | "other",
  string
> = {
  wedding: "Abadikan momen bahagia bersama kami",
  birthday: "Bagikan keseruan pesta ulang tahun",
  graduation: "Bagikan momen kelulusanmu",
  corporate: "Bagikan momen acara bersama tim",
  other: "Bagikan foto dan ucapanmu di sini",
};

export function getSignageFilename(slug: string, template: SignageTemplate) {
  return `manunggal-${slug}-signage-${template.toLowerCase()}.pdf`;
}
