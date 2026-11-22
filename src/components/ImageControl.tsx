import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Link2,
  RotateCcw,
  Upload,
  ZoomIn,
} from 'lucide-react';
import { ImageFit } from '../data/siteData';
import { parsePosition, readAndCompressImage } from '../utils/imageUpload';

export const BUILTIN_IMAGES: { src: string; label: string }[] = [
  { src: '/images/hero-lab.jpg', label: 'Hardware Bench' },
  { src: '/images/project-astra.jpg', label: 'ASTRA' },
  { src: '/images/project-kavach.jpg', label: 'Aarogya Kavach' },
  { src: '/images/project-soilsense.jpg', label: 'SoilSense' },
];

export interface ImageControlValue {
  src: string;
  alt: string;
  caption?: string;
  position: string;
  fit: ImageFit;
  zoom: number;
}

interface ImageControlProps {
  title?: string;
  aspectClass?: string;
  value: ImageControlValue;
  defaultSrc: string;
  showCaption?: boolean;
  onChange: (next: Partial<ImageControlValue>) => void;
}

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none';
const labelCls =
  'block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]';

export const ImageControl: React.FC<ImageControlProps> = ({
  title = 'Image Controls',
  aspectClass = 'aspect-[16/10]',
  value,
  defaultSrc,
  showCaption = false,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { x, y } = parsePosition(value.position);
  const zoom = value.zoom && value.zoom >= 1 ? value.zoom : 1;
  const fit: ImageFit = value.fit || 'cover';

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const dataUrl = await readAndCompressImage(file);
      onChange({ src: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image.');
    } finally {
      setUploading(false);
    }
  };

  const setFocal = (nx: number, ny: number) => {
    onChange({ position: `${Math.round(nx)}% ${Math.round(ny)}%` });
  };

  const resetFraming = () => {
    onChange({ position: '50% 50%', fit: 'cover', zoom: 1 });
  };

  const isDataUrl = value.src.startsWith('data:');

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFraming}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
          >
            Reset crop
          </button>
          <span className="text-[var(--border-strong)]">·</span>
          <button
            type="button"
            onClick={() =>
              onChange({
                src: defaultSrc,
                position: '50% 50%',
                fit: 'cover',
                zoom: 1,
              })
            }
            className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Default photo
          </button>
        </div>
      </div>

      {/* Live Preview + Drag/Drop Upload */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`relative overflow-hidden rounded-xl border-2 bg-[var(--surface-subtle)] transition-colors ${aspectClass} ${
              dragging ? 'border-[var(--accent)]' : 'border-[var(--border)]'
            }`}
          >
            {value.src ? (
              <img
                src={value.src}
                alt={value.alt || 'Preview'}
                style={{
                  objectPosition: `${x}% ${y}%`,
                  transform: `scale(${zoom})`,
                }}
                className={`h-full w-full transition-transform duration-150 ${
                  fit === 'contain' ? 'object-contain' : 'object-cover'
                }`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--text-muted)]">
                No image
              </div>
            )}

            {/* Focal point reticle */}
            {fit === 'cover' && (
              <span
                style={{ left: `${x}%`, top: `${y}%` }}
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--accent)]/80 shadow"
                title="Focal point"
              />
            )}

            {dragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-medium text-white backdrop-blur-xs">
                Drop image to replace
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:col-span-7">
          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] px-4 py-2.5 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>
                {uploading
                  ? 'Optimizing image...'
                  : 'Upload from device (or drag & drop)'}
              </span>
            </button>
            {error && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {isDataUrl && (
              <p className="mt-1 font-mono-meta text-[10px] text-[var(--accent)]">
                ✓ Custom uploaded image stored locally
              </p>
            )}
          </div>

          {/* URL Input */}
          <div>
            <label className={labelCls}>Image URL or Path</label>
            <div className="relative mt-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={isDataUrl ? '' : value.src}
                onChange={(e) => onChange({ src: e.target.value })}
                placeholder={
                  isDataUrl
                    ? 'Using uploaded image — paste URL to replace'
                    : 'https://... or /images/...'
                }
                className={`${inputCls} pl-8 text-xs`}
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className={labelCls}>Built-in Presets</label>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {BUILTIN_IMAGES.map((preset) => {
                const selected = value.src === preset.src;
                return (
                  <button
                    key={preset.src}
                    type="button"
                    onClick={() => onChange({ src: preset.src })}
                    title={preset.label}
                    className={`group relative h-11 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                      selected
                        ? 'border-[var(--accent)]'
                        : 'border-[var(--border)] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.src}
                      alt={preset.label}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Granular Framing Controls */}
      <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-3.5 sm:grid-cols-3">
        {/* Fit Mode */}
        <div>
          <label className={labelCls}>Fit Mode</label>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {(['cover', 'contain'] as ImageFit[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ fit: mode })}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  fit === mode
                    ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                    : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1">
                <ZoomIn className="h-3 w-3" /> Zoom
              </span>
            </label>
            <span className="font-mono-meta text-[10px] text-[var(--text-secondary)]">
              {zoom.toFixed(2)}×
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={1.6}
            step={0.02}
            value={zoom}
            onChange={(e) => onChange({ zoom: parseFloat(e.target.value) })}
            className="mt-2.5 w-full accent-[var(--accent)] cursor-pointer"
          />
        </div>
      </div>

      {/* Focal Point X & Y */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls}>Focal Point X (Horizontal)</label>
            <span className="font-mono-meta text-[10px] text-[var(--text-secondary)]">
              {Math.round(x)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={x}
            onChange={(e) => setFocal(Number(e.target.value), y)}
            className="mt-1.5 w-full accent-[var(--accent)] cursor-pointer"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls}>Focal Point Y (Vertical)</label>
            <span className="font-mono-meta text-[10px] text-[var(--text-secondary)]">
              {Math.round(y)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={y}
            onChange={(e) => setFocal(x, Number(e.target.value))}
            className="mt-1.5 w-full accent-[var(--accent)] cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Focal Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono-meta text-[10px] uppercase tracking-wider text-[var(--text-muted)] mr-1">
          Quick focus:
        </span>
        {[
          { label: 'Center', px: 50, py: 50 },
          { label: 'Top', px: 50, py: 15 },
          { label: 'Bottom', px: 50, py: 85 },
          { label: 'Left', px: 15, py: 50 },
          { label: 'Right', px: 85, py: 50 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setFocal(p.px, p.py)}
            className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Caption & Alt Text */}
      <div className={`grid grid-cols-1 gap-3 ${showCaption ? 'sm:grid-cols-2' : ''}`}>
        {showCaption && (
          <div>
            <label className={labelCls}>Figure Caption</label>
            <input
              type="text"
              value={value.caption ?? ''}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="FIG. 01 — EDGE HARDWARE BENCH"
              className={`${inputCls} mt-1 text-xs`}
            />
          </div>
        )}
        <div>
          <label className={labelCls}>Alt Text (Accessibility)</label>
          <input
            type="text"
            value={value.alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Describe the image"
            className={`${inputCls} mt-1 text-xs`}
          />
        </div>
      </div>
    </div>
  );
};
