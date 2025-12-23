"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        textColor: 'text-emerald-400',
        iconColor: 'text-emerald-500',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-500/10 border-red-500/30',
        textColor: 'text-red-400',
        iconColor: 'text-red-500',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-yellow-500/10 border-yellow-500/30',
        textColor: 'text-yellow-400',
        iconColor: 'text-yellow-500',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-500/10 border-blue-500/30',
        textColor: 'text-blue-400',
        iconColor: 'text-blue-500',
    },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
    const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => {
                    const config = toastConfig[toast.type];
                    const Icon = config.icon;
                    
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg animate-slide-in ${config.bgColor}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                            <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
                                {toast.message}
                            </p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-white transition flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <style jsx global>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
}
