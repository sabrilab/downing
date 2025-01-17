import React, { createContext, useContext, useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "bg-white rounded-lg shadow-lg p-4 flex items-start justify-between",
              toast.variant === 'destructive' && "bg-red-50 border-red-500"
            )}
          >
            <div>
              {toast.title && (
                <h4 className={cn(
                  "text-sm font-medium",
                  toast.variant === 'destructive' && "text-red-800"
                )}>
                  {toast.title}
                </h4>
              )}
              {toast.description && (
                <p className={cn(
                  "text-sm text-gray-500",
                  toast.variant === 'destructive' && "text-red-700"
                )}>
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export const toast = {
  default: (props: Omit<Toast, 'id' | 'variant'>) => {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ ...props, variant: 'default' });
    }
  },
  error: (props: Omit<Toast, 'id' | 'variant'>) => {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ ...props, variant: 'destructive' });
    }
  }
};
