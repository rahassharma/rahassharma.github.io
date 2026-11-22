import React, { useRef, useState } from 'react';
import {
  Check,
  RotateCcw,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import {
  BUILTIN_FONTS,
  DEFAULT_FONT_SETTINGS,
  FONT_CATEGORIES,
  FontCategoryKey,
  FontSettings,
  UploadedFont,
  readFontFile,
  resolveFontStack,
} from '../utils/fontManager';

interface FontsTabProps {
  fonts: FontSettings;
  onChange: (next: FontSettings) => void;
}

const inputCls =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none';
const labelCls =
  'block font-mono-meta text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const FontsTab: React.FC<FontsTabProps> = ({ fonts, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const safeFonts: FontSettings = {
    ...DEFAULT_FONT_SETTINGS,
    ...fonts,
    uploadedFonts: Array.isArray(fonts?.uploadedFonts)
      ? fonts.uploadedFonts
      : [],
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError('');
    setUploadSuccess('');
    setUploading(true);

    const added: UploadedFont[] = [];
    try {
      for (const file of Array.from(fileList)) {
        const parsed = await readFontFile(file);
        added.push(parsed);
      }
      if (added.length > 0) {
        onChange({
          ...safeFonts,
          uploadedFonts: [...safeFonts.uploadedFonts, ...added],
        });
        setUploadSuccess(
          added.length === 1
            ? `Uploaded "${added[0].name}" — assign it to any category below.`
            : `Uploaded ${added.length} fonts — assign them to any category below.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload font.');
    } finally {
      setUploading(false);
    }
  };

  const updateCategory = (key: FontCategoryKey, fontId: string) => {
    onChange({
      ...safeFonts,
      [key]: fontId,
    });
  };

  const applyFontEverywhere = (fontId: string) => {
    onChange({
      ...safeFonts,
      headings: fontId,
      body: fontId,
      buttons: fontId,
      nav: fontId,
      mono: fontId,
    });
  };

  const renameUploadedFont = (id: string, name: string) => {
    onChange({
      ...safeFonts,
      uploadedFonts: safeFonts.uploadedFonts.map((f) =>
        f.id === id ? { ...f, name } : f
      ),
    });
  };

  const deleteUploadedFont = (id: string) => {
    const nextUploaded = safeFonts.uploadedFonts.filter((f) => f.id !== id);
    onChange({
      headings:
        safeFonts.headings === id
          ? DEFAULT_FONT_SETTINGS.headings
          : safeFonts.headings,
      body:
        safeFonts.body === id ? DEFAULT_FONT_SETTINGS.body : safeFonts.body,
      buttons:
        safeFonts.buttons === id
          ? DEFAULT_FONT_SETTINGS.buttons
          : safeFonts.buttons,
      nav: safeFonts.nav === id ? DEFAULT_FONT_SETTINGS.nav : safeFonts.nav,
      mono:
        safeFonts.mono === id ? DEFAULT_FONT_SETTINGS.mono : safeFonts.mono,
      uploadedFonts: nextUploaded,
    });
  };

  const resetToDefaultFonts = () => {
    onChange({
      ...DEFAULT_FONT_SETTINGS,
      uploadedFonts: safeFonts.uploadedFonts,
    });
  };

  const serifBuiltins = BUILTIN_FONTS.filter((f) => f.group === 'Serif');
  const sansBuiltins = BUILTIN_FONTS.filter((f) => f.group === 'Sans-Serif');
  const monoBuiltins = BUILTIN_FONTS.filter((f) => f.group === 'Monospace');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif-display text-2xl text-[var(--text)]">
            Typography & Custom Font Uploads
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            Upload your own font files from your device (<code>.woff2</code>,{' '}
            <code>.woff</code>, <code>.ttf</code>, <code>.otf</code>) and assign
            different fonts to headings, body text, buttons, navigation, and
            metadata. Published worldwide with Firebase!
          </p>
        </div>

        <button
          type="button"
          onClick={resetToDefaultFonts}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text)] cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset assignments</span>
        </button>
      </div>

      {/* Upload Custom Font Dropzone */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className={labelCls}>Upload Your Own Font File From Device</p>
          <span className="font-mono-meta text-[10px] text-[var(--text-muted)]">
            .WOFF2 · .WOFF · .TTF · .OTF (max 2.5 MB)
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging
              ? 'border-[var(--accent)] bg-[var(--accent-soft)]/50'
              : 'border-[var(--border-strong)] bg-[var(--bg)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Upload className="h-4 w-4" />
          </span>
          <p className="mt-2.5 text-xs font-medium text-[var(--text)]">
            {uploading
              ? 'Loading font file...'
              : 'Drag & drop font files here, or browse from device'}
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--text)] px-4 py-2 text-xs font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Choose Font File(s)</span>
          </button>
        </div>

        {error && (
          <p className="mt-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}
        {uploadSuccess && (
          <p className="mt-2.5 flex items-center gap-2 rounded-xl border border-[var(--accent)]/35 bg-[var(--accent-soft)] px-3.5 py-2 text-xs text-[var(--text)]">
            <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>{uploadSuccess}</span>
          </p>
        )}

        {/* Uploaded Fonts Library */}
        {safeFonts.uploadedFonts.length > 0 && (
          <div className="mt-5 space-y-2.5">
            <p className={labelCls}>
              Your Uploaded Fonts ({safeFonts.uploadedFonts.length})
            </p>
            {safeFonts.uploadedFonts.map((uf) => (
              <div
                key={uf.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Type className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={uf.name}
                      onChange={(e) => renameUploadedFont(uf.id, e.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-sm font-semibold text-[var(--text)] hover:border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--bg)] focus:outline-none"
                      aria-label="Font name"
                    />
                    <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 font-mono-meta text-[10px] uppercase text-[var(--text-muted)]">
                      {uf.format} · {formatBytes(uf.sizeBytes)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyFontEverywhere(uf.id)}
                      className="rounded-full border border-[var(--border-strong)] px-2.5 py-1 text-[10px] font-medium text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
                    >
                      Use Everywhere
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUploadedFont(uf.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-red-300 hover:text-red-600 cursor-pointer"
                      aria-label={`Delete font ${uf.name}`}
                      title="Delete uploaded font"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Sample in the Uploaded Font */}
                <p
                  style={{ fontFamily: `'${uf.family}', sans-serif` }}
                  className="mt-2.5 truncate rounded-lg bg-[var(--bg)] px-3 py-2 text-lg text-[var(--text)]"
                >
                  Rahas Sharma — Edge Computing &amp; Humanitarian Tech 0123456789
                </p>

                {/* Quick-Assign Category Pills */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono-meta text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Assign to:
                  </span>
                  {FONT_CATEGORIES.map((cat) => {
                    const isAssigned = safeFonts[cat.key] === uf.id;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => updateCategory(cat.key, uf.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                          isAssigned
                            ? 'bg-[var(--accent)] text-white'
                            : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                        }`}
                      >
                        {cat.key === 'headings'
                          ? 'Headings'
                          : cat.key === 'body'
                            ? 'Body'
                            : cat.key === 'buttons'
                              ? 'Buttons'
                              : cat.key === 'nav'
                                ? 'Navbar'
                                : 'Meta/Code'}
                        {isAssigned ? ' ✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Granular Per-Category Font Assignment */}
      <div className="space-y-3.5">
        <p className={labelCls}>Assign Font Per Website Category</p>

        {FONT_CATEGORIES.map((cat) => {
          const selectedId = safeFonts[cat.key];
          const fallbackGroup =
            cat.key === 'headings'
              ? 'serif'
              : cat.key === 'mono'
                ? 'mono'
                : 'sans';
          const previewStack = resolveFontStack(
            selectedId,
            safeFonts.uploadedFonts,
            fallbackGroup
          );

          return (
            <div
              key={cat.key}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4"
            >
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {cat.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    {cat.description}
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <select
                    value={selectedId}
                    onChange={(e) => updateCategory(cat.key, e.target.value)}
                    className={inputCls}
                    aria-label={cat.label}
                  >
                    {safeFonts.uploadedFonts.length > 0 && (
                      <optgroup label="Your Uploaded Fonts">
                        {safeFonts.uploadedFonts.map((uf) => (
                          <option key={uf.id} value={uf.id}>
                            ★ {uf.name} ({uf.format})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Display / Serif">
                      {serifBuiltins.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="UI / Sans-Serif">
                      {sansBuiltins.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Technical / Monospace">
                      {monoBuiltins.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Category Live Preview */}
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5">
                {cat.key === 'buttons' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      style={{ fontFamily: previewStack }}
                      className="inline-flex rounded-full bg-[var(--text)] px-4 py-1.5 text-xs font-medium text-[var(--bg)]"
                    >
                      Peer-Reviewed Papers
                    </span>
                    <span
                      style={{ fontFamily: previewStack }}
                      className="inline-flex rounded-full border border-[var(--border-strong)] px-4 py-1.5 text-xs font-medium text-[var(--text)]"
                    >
                      Engineering Portfolio
                    </span>
                    <span
                      style={{ fontFamily: previewStack }}
                      className="inline-flex rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-medium text-white"
                    >
                      Publish Worldwide
                    </span>
                  </div>
                ) : (
                  <p
                    style={{ fontFamily: previewStack }}
                    className={
                      cat.key === 'headings'
                        ? 'text-2xl leading-snug text-[var(--text)]'
                        : cat.key === 'mono'
                          ? 'text-xs tracking-wide text-[var(--accent)]'
                          : cat.key === 'nav'
                            ? 'text-sm font-medium tracking-wide text-[var(--text)]'
                            : 'text-sm leading-relaxed text-[var(--text-secondary)]'
                    }
                  >
                    {cat.preview}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
