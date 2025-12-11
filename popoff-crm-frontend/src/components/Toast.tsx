import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastType } from '../contexts/ToastContext';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-accent-2/50 bg-accent-2/10 text-accent-2',
  error: 'border-red-500/50 bg-red-500/10 text-red-100',
  info: 'border-primary/50 bg-card/80 text-text',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => onDismiss(toast.id), toast.durationMs ?? 4200),
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [onDismiss, toasts]);

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full max-w-lg rounded-xl border px-4 py-3 shadow-soft/40 backdrop-blur ${typeStyles[toast.type]}`}
          >
            {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
            <div className="text-sm leading-relaxed">{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="absolute right-3 top-3 text-xs text-primary hover:text-text"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
