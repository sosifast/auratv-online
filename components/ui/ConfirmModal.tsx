"use client";

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melakukan aksi ini?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'danger',
    loading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            buttonBg: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-yellow-500/10',
            iconColor: 'text-yellow-500',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        },
        info: {
            icon: AlertTriangle,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={!loading ? onClose : undefined}
            />
            
            {/* Modal */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-modal-in">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition disabled:opacity-50"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-8 h-8 ${config.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-400 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 ${config.buttonBg}`}
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes modal-in {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-modal-in {
                    animation: modal-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
