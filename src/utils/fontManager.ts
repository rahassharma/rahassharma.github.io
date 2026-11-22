export type FontCategoryKey =
  | 'headings'
  | 'body'
  | 'buttons'
  | 'nav'
  | 'mono';

export interface UploadedFont {
  id: string;
  name: string;
  family: string;
  format: 'woff2' | 'woff' | 'truetype' | 'opentype';
  dataUrl: string;
  sizeBytes: number;
}

export interface FontSettings {
  headings: string;
  body: string;
  buttons: string;
  nav: string;
  mono: string;
  uploadedFonts: UploadedFont[];
}

export interface BuiltinFontOption {
  id: string;
  name: string;
  stack: string;
  group: 'Serif' | 'Sans-Serif' | 'Monospace';
  googleFamily?: string;
}

export const BUILTIN_FONTS: BuiltinFontOption[] = [
  {
    id: 'instrument-serif',
    name: 'Instrument Serif (Default Display)',
    stack: "'Instrument Serif', Georgia, serif",
    group: 'Serif',
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    stack: "'Playfair Display', Georgia, serif",
    group: 'Serif',
    googleFamily: 'Playfair+Display:ital,wght@0,400;0,600;1,400',
  },
  {
    id: 'fraunces',
    name: 'Fraunces',
    stack: "'Fraunces', Georgia, serif",
    group: 'Serif',
    googleFamily: 'Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400',
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    stack: "'Cormorant Garamond', Georgia, serif",
    group: 'Serif',
    googleFamily: 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
  },
  {
    id: 'lora',
    name: 'Lora',
    stack: "'Lora', Georgia, serif",
    group: 'Serif',
    googleFamily: 'Lora:ital,wght@0,400;0,600;1,400',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans (Default Body)',
    stack: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    group: 'Sans-Serif',
  },
  {
    id: 'inter',
    name: 'Inter',
    stack: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    group: 'Sans-Serif',
    googleFamily: 'Inter:wght@400;500;600;700',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    stack: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    group: 'Sans-Serif',
    googleFamily: 'Space+Grotesk:wght@400;500;600;700',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    stack: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    group: 'Sans-Serif',
    googleFamily: 'DM+Sans:wght@400;500;600;700',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    stack: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    group: 'Sans-Serif',
    googleFamily: 'Manrope:wght@400;500;600;700',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    stack: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    group: 'Sans-Serif',
    googleFamily: 'Outfit:wght@400;500;600;700',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono (Default Meta)',
    stack: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    group: 'Monospace',
  },
  {
    id: 'ibm-plex-mono',
    name: 'IBM Plex Mono',
    stack: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
    group: 'Monospace',
    googleFamily: 'IBM+Plex+Mono:wght@400;500;600',
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    stack: "'Space Mono', ui-monospace, SFMono-Regular, monospace",
    group: 'Monospace',
    googleFamily: 'Space+Mono:wght@400;700',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    stack: "'Fira Code', ui-monospace, SFMono-Regular, monospace",
    group: 'Monospace',
    googleFamily: 'Fira+Code:wght@400;500;600',
  },
];

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  headings: 'instrument-serif',
  body: 'plus-jakarta-sans',
  buttons: 'plus-jakarta-sans',
  nav: 'plus-jakarta-sans',
  mono: 'jetbrains-mono',
  uploadedFonts: [],
};

export const FONT_CATEGORIES: {
  key: FontCategoryKey;
  label: string;
  description: string;
  preview: string;
}[] = [
  {
    key: 'headings',
    label: 'Headings & Display Titles',
    description: 'Hero display headline, section titles, project & publication titles.',
    preview: 'Offline-first edge systems for real impact',
  },
  {
    key: 'body',
    label: 'Main Body Text',
    description: 'Paragraphs, mission statement, abstracts, descriptions & specifications.',
    preview: 'Low-cost embedded architectures engineered for rural reliability.',
  },
  {
    key: 'buttons',
    label: 'Buttons & Interactive Controls',
    description: 'All buttons, CTAs, filter tabs, pills, inputs & form controls.',
    preview: 'Peer-Reviewed Papers  ·  Engineering Portfolio  ·  Copy Email',
  },
  {
    key: 'nav',
    label: 'Navigation & Header Links',
    description: 'Top navbar brand, section navigation links & footer links.',
    preview: 'Mission   Publications   Projects   Honors   Contact',
  },
  {
    key: 'mono',
    label: 'Meta, Tags, Coordinates & Code',
    description: 'Section numbers, dates, IEEE badges, coordinates, stack tags & BibTeX.',
    preview: '01 / SELECTED RESEARCH · 32.90° N, 74.74° E · R = 0.059',
  },
];

function detectFontFormat(
  filename: string
): 'woff2' | 'woff' | 'truetype' | 'opentype' | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'woff2') return 'woff2';
  if (ext === 'woff') return 'woff';
  if (ext === 'ttf') return 'truetype';
  if (ext === 'otf') return 'opentype';
  return null;
}

export function readFontFile(file: File): Promise<UploadedFont> {
  return new Promise((resolve, reject) => {
    const format = detectFontFormat(file.name);
    if (!format) {
      reject(
        new Error(
          'Unsupported font file. Please upload a .woff2, .woff, .ttf, or .otf font.'
        )
      );
      return;
    }

    // Warn/guard against huge files that exceed browser storage or slow down visitors
    if (file.size > 2_500_000) {
      reject(
        new Error(
          'Font file is larger than 2.5 MB. Please use a compressed .woff2 version for fast worldwide loading.'
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read font file.'));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const id = `custom-font-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const family = `CustomFont_${id.replace(/[^a-zA-Z0-9_]/g, '')}`;
      resolve({
        id,
        name: baseName || 'Custom Font',
        family,
        format,
        dataUrl,
        sizeBytes: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}

export function resolveFontStack(
  fontId: string,
  uploadedFonts: UploadedFont[],
  fallbackGroup: 'serif' | 'sans' | 'mono' = 'sans'
): string {
  const uploaded = uploadedFonts.find((f) => f.id === fontId);
  if (uploaded) {
    const fb =
      fallbackGroup === 'serif'
        ? 'Georgia, serif'
        : fallbackGroup === 'mono'
          ? 'ui-monospace, monospace'
          : '-apple-system, BlinkMacSystemFont, sans-serif';
    return `'${uploaded.family}', ${fb}`;
  }

  const builtin = BUILTIN_FONTS.find((f) => f.id === fontId);
  if (builtin) return builtin.stack;

  if (fallbackGroup === 'serif') return "'Instrument Serif', Georgia, serif";
  if (fallbackGroup === 'mono') return "'JetBrains Mono', ui-monospace, monospace";
  return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
}

const STYLE_ELEMENT_ID = 'custom-uploaded-fonts-style';
const GOOGLE_LINK_ID = 'dynamic-google-fonts-link';

/**
 * Injects @font-face declarations for all uploaded fonts, loads any needed
 * Google Fonts, and updates CSS typography variables on :root.
 */
export function applyFontSettingsToDocument(settings: FontSettings): void {
  const uploaded = settings.uploadedFonts || [];

  // 1. Inject @font-face rules for uploaded fonts
  let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = uploaded
    .map(
      (f) => `@font-face {
  font-family: '${f.family}';
  src: url('${f.dataUrl}') format('${f.format}');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}`
    )
    .join('\n');

  // 2. Load any selected extra Google Fonts dynamically
  const activeIds = new Set([
    settings.headings,
    settings.body,
    settings.buttons,
    settings.nav,
    settings.mono,
  ]);
  const googleFamilies: string[] = [];
  activeIds.forEach((id) => {
    const match = BUILTIN_FONTS.find((b) => b.id === id);
    if (match?.googleFamily) {
      googleFamilies.push(`family=${match.googleFamily}`);
    }
  });

  let linkEl = document.getElementById(GOOGLE_LINK_ID) as HTMLLinkElement | null;
  if (googleFamilies.length > 0) {
    const href = `https://fonts.googleapis.com/css2?${googleFamilies.join('&')}&display=swap`;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = GOOGLE_LINK_ID;
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }
    if (linkEl.href !== href) {
      linkEl.href = href;
    }
  } else if (linkEl) {
    linkEl.remove();
  }

  // 3. Apply CSS custom properties on :root
  const root = document.documentElement;
  root.style.setProperty(
    '--font-serif',
    resolveFontStack(settings.headings, uploaded, 'serif')
  );
  root.style.setProperty(
    '--font-sans',
    resolveFontStack(settings.body, uploaded, 'sans')
  );
  root.style.setProperty(
    '--font-buttons',
    resolveFontStack(settings.buttons, uploaded, 'sans')
  );
  root.style.setProperty(
    '--font-nav',
    resolveFontStack(settings.nav, uploaded, 'sans')
  );
  root.style.setProperty(
    '--font-mono',
    resolveFontStack(settings.mono, uploaded, 'mono')
  );
}
