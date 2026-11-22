/**
 * Reads an uploaded image file and resizes/compresses it via canvas
 * so it remains crisp while fitting comfortably within browser localStorage.
 */
export function readAndCompressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPG, PNG, WebP, etc.).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const dataUrl = String(reader.result);

      // Keep small SVGs or GIFs untouched
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const mime =
          file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        try {
          const compressed =
            mime === 'image/png' && file.size < 350_000
              ? canvas.toDataURL('image/png')
              : canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function parsePosition(pos?: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const parts = pos.trim().split(/\s+/);
  const parsePart = (v: string | undefined, fallback: number) => {
    if (!v) return fallback;
    if (v === 'left' || v === 'top') return 0;
    if (v === 'center') return 50;
    if (v === 'right' || v === 'bottom') return 100;
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
  };
  return {
    x: parsePart(parts[0], 50),
    y: parsePart(parts[1] ?? parts[0], 50),
  };
}
