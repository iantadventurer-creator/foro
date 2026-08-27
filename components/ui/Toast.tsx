'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'info';
export type ToastItem = { id: number; message: string; variant: ToastVariant };

/** Notificaciones propias en lugar de alert()/confirm() nativos del navegador. */
export function useToasts() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idRef = useRef(0);

    const push = useCallback((message: string, variant: ToastVariant = 'info') => {
        const id = ++idRef.current;
        setToasts((current) => [...current, { id, message, variant }]);
        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id));
        }, 4500);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    return { toasts, push, dismiss };
}

const variantStyles: Record<ToastVariant, string> = {
    error: 'bg-[#2a1220] border-[var(--color-accent-2)]/50 text-[var(--color-accent-2)]',
    success: 'bg-[#0f2a1c] border-[var(--color-accent-4)]/50 text-[var(--color-accent-4)]',
    info: 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)]',
};

export function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
    return (
        <div
            className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-full sm:max-w-sm"
            aria-live="polite"
            role="status"
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 ${variantStyles[toast.variant]}`}
                    >
                        <span className="leading-snug">{toast.message}</span>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            aria-label="Cerrar notificación"
                            className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        >
                            ✕
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
