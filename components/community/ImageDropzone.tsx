'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ALLOWED_IMAGE_TYPES } from '@/lib/validation';

/** Zona para elegir la foto: se arrastra o se hace clic, se valida al momento
 * (tipo y tamaño) y se muestra una vista previa antes de publicar. */
export function ImageDropzone({
    file,
    onChange,
    maxSizeMb,
    labels,
    onInvalid,
}: {
    file: File | null;
    onChange: (file: File | null) => void;
    maxSizeMb: number;
    labels: { title: string; hint: string; change: string; remove: string; input: string };
    /** Recibe 'format' o 'size' cuando el archivo elegido no vale. */
    onInvalid: (reason: 'format' | 'size') => void;
}) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // La vista previa usa una URL local del archivo; se libera al cambiarlo.
    useEffect(() => {
        if (!file) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const pick = (candidate: File | undefined) => {
        if (!candidate) return;
        if (!ALLOWED_IMAGE_TYPES.includes(candidate.type)) {
            onInvalid('format');
            return;
        }
        if (candidate.size > maxSizeMb * 1024 * 1024) {
            onInvalid('size');
            return;
        }
        onChange(candidate);
    };

    const input = (
        <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            aria-label={labels.input}
            className="sr-only"
            onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = '';
            }}
        />
    );

    if (file && previewUrl) {
        return (
            <div className="rounded-xl border border-[var(--color-border)] bg-black overflow-hidden">
                {input}
                {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), next/image no aplica */}
                <img src={previewUrl} alt="" className="w-full max-h-72 object-contain" />
                <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[var(--color-surface-2)] text-xs">
                    <span className="truncate text-[var(--color-text-muted)]">{file.name}</span>
                    <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => inputRef.current?.click()} className="font-bold text-[var(--color-accent-3-text)] hover:underline py-1">
                            {labels.change}
                        </button>
                        <button type="button" onClick={() => onChange(null)} className="font-bold text-[var(--color-danger-text)] hover:underline py-1">
                            {labels.remove}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <label
            htmlFor={inputId}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center justify-center gap-3 text-center rounded-3xl border-[3px] border-dashed border-[var(--color-border)] px-4 py-10 cursor-pointer transition-colors focus-within:bg-[var(--color-surface-2)] ${dragging
                ? 'bg-[var(--color-highlight)]/30'
                : 'hover:bg-[var(--color-surface-2)] bg-[var(--color-surface)]'
                }`}
        >
            {input}
            <span className="toy-sm w-12 h-12 rounded-2xl bg-[var(--color-highlight)] text-[var(--color-highlight-ink)] flex items-center justify-center text-3xl font-black leading-none" aria-hidden="true">+</span>
            <span className="text-sm font-extrabold text-[var(--color-text)]">{labels.title}</span>
            <span className="text-xs text-[var(--color-text-faint)]">{labels.hint}</span>
        </label>
    );
}
