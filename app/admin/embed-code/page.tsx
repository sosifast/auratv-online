"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface EmbedCode {
    id: string;
    name: string;
    description: string | null;
    code: string;
    placement: 'header' | 'body_start' | 'body_end' | 'footer';
    page_target: string;
    priority: number;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
}

const placementOptions = [
    { value: 'header', label: 'Header (Head Tag)' },
    { value: 'body_start', label: 'Body Start' },
    { value: 'body_end', label: 'Body End' },
    { value: 'footer', label: 'Footer' },
];

const pageTargetOptions = [
    { value: 'all', label: 'All Pages' },
    { value: 'homepage', label: 'Homepage' },
    { value: 'play', label: 'Play Page' },
    { value: 'category', label: 'Category Page' },
    { value: 'search', label: 'Search Page' },
    { value: 'faq', label: 'FAQ Page' },
    { value: 'help', label: 'Help Page' },
    { value: 'privacy', label: 'Privacy Page' },
    { value: 'terms', label: 'Terms Page' },
];

export default function EmbedCodePage() {
    const [embedCodes, setEmbedCodes] = useState<EmbedCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState<EmbedCode | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' });
    const toast = useToast();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: '',
        placement: 'header' as 'header' | 'body_start' | 'body_end' | 'footer',
        page_target: 'all',
        priority: 0,
        is_enabled: true,
    });

    useEffect(() => {
        fetchEmbedCodes();
    }, []);

    async function fetchEmbedCodes() {
        try {
            const { data, error } = await supabase
                .from('embed_codes')
                .select('*')
                .order('priority', { ascending: false });

            if (error) throw error;
            setEmbedCodes(data || []);
        } catch (error: any) {
            toast.error('Failed to fetch embed codes: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingCode(null);
        setFormData({
            name: '',
            description: '',
            code: '',
            placement: 'header' as 'header' | 'body_start' | 'body_end' | 'footer',
            page_target: 'all',
            priority: 0,
            is_enabled: true,
        });
        setShowModal(true);
    }

    function openEditModal(embedCode: EmbedCode) {
        setEditingCode(embedCode);
        setFormData({
            name: embedCode.name,
            description: embedCode.description || '',
            code: embedCode.code,
            placement: embedCode.placement,
            page_target: embedCode.page_target,
            priority: embedCode.priority,
            is_enabled: embedCode.is_enabled,
        });
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.name.trim() || !formData.code.trim()) {
            toast.error('Name and Code are required');
            return;
        }

        try {
            if (editingCode) {
                const { error } = await supabase
                    .from('embed_codes')
                    .update({
                        name: formData.name,
                        description: formData.description || null,
                        code: formData.code,
                        placement: formData.placement,
                        page_target: formData.page_target,
                        priority: formData.priority,
                        is_enabled: formData.is_enabled,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingCode.id);

                if (error) throw error;
                toast.success('Embed code updated successfully');
            } else {
                const { error } = await supabase
                    .from('embed_codes')
                    .insert({
                        name: formData.name,
                        description: formData.description || null,
                        code: formData.code,
                        placement: formData.placement,
                        page_target: formData.page_target,
                        priority: formData.priority,
                        is_enabled: formData.is_enabled,
                    });

                if (error) throw error;
                toast.success('Embed code created successfully');
            }

            setShowModal(false);
            fetchEmbedCodes();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        }
    }

    async function handleDelete(id: string) {
        try {
            const { error } = await supabase
                .from('embed_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Embed code deleted successfully');
            fetchEmbedCodes();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        }
        setConfirmModal({ show: false, id: '', name: '' });
    }

    async function toggleEnabled(embedCode: EmbedCode) {
        try {
            const { error } = await supabase
                .from('embed_codes')
                .update({ is_enabled: !embedCode.is_enabled, updated_at: new Date().toISOString() })
                .eq('id', embedCode.id);

            if (error) throw error;
            toast.success(`Embed code ${!embedCode.is_enabled ? 'enabled' : 'disabled'}`);
            fetchEmbedCodes();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Embed Codes</h1>
                    <p className="text-gray-400 mt-1">Manage custom scripts, tracking codes, and embeds</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Embed Code
                </button>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 text-left">
                            <th className="px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-400">Placement</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-400">Page Target</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-400">Priority</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {embedCodes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No embed codes found. Click "Add Embed Code" to create one.
                                </td>
                            </tr>
                        ) : (
                            embedCodes.map((embedCode) => (
                                <tr key={embedCode.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-white font-medium">{embedCode.name}</p>
                                            {embedCode.description && (
                                                <p className="text-gray-500 text-sm truncate max-w-xs">{embedCode.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-400">
                                            {embedCode.placement}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-400">
                                            {embedCode.page_target}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{embedCode.priority}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleEnabled(embedCode)}
                                            className={`px-3 py-1 text-xs rounded-full transition ${
                                                embedCode.is_enabled
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                            }`}
                                        >
                                            {embedCode.is_enabled ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(embedCode)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setConfirmModal({ show: true, id: embedCode.id, name: embedCode.name })}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                            <h2 className="text-xl font-bold text-white">
                                {editingCode ? 'Edit Embed Code' : 'Add Embed Code'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                    placeholder="e.g., Google Analytics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Code *</label>
                                <textarea
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                                    placeholder="<script>...</script>"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Placement</label>
                                    <select
                                        value={formData.placement}
                                        onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                    >
                                        {placementOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Page Target</label>
                                    <select
                                        value={formData.page_target}
                                        onChange={(e) => setFormData({ ...formData, page_target: e.target.value })}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                    >
                                        {pageTargetOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority (higher = first)</label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer mt-6">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_enabled}
                                            onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                                            className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-red-600 focus:ring-red-600"
                                        />
                                        <span className="text-gray-300">Enabled</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                >
                                    {editingCode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmModal.show}
                onClose={() => setConfirmModal({ show: false, id: '', name: '' })}
                onConfirm={() => handleDelete(confirmModal.id)}
                title="Delete Embed Code"
                message={`Are you sure you want to delete "${confirmModal.name}"? This action cannot be undone.`}
                type="danger"
            />
        </div>
    );
}
