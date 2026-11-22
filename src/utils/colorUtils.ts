export function normalizeHex(input: string): string | null {
  const cleaned = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clampByte(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  weightB: number
) {
  const wA = 1 - weightB;
  return {
    r: a.r * wA + b.r * weightB,
    g: a.g * wA + b.g * weightB,
    b: a.b * wA + b.b * weightB,
  };
}

export function computeAccentTokens(
  hex: string,
  theme: 'light' | 'dark'
): { accent: string; hover: string; soft: string } {
  const valid = normalizeHex(hex) || '#265C4B';
  const rgb = hexToRgb(valid);

  if (theme === 'dark') {
    const hoverRgb = mixRgb(rgb, { r: 255, g: 255, b: 255 }, 0.16);
    return {
      accent: valid,
      hover: rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
      soft: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`,
    };
  }

  const hoverRgb = mixRgb(rgb, { r: 0, g: 0, b: 0 }, 0.16);
  const softRgb = mixRgb(rgb, { r: 255, g: 255, b: 255 }, 0.88);
  return {
    accent: valid,
    hover: rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
    soft: rgbToHex(softRgb.r, softRgb.g, softRgb.b),
  };
}
