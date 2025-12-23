"use client";

import React, { useState, useEffect } from 'react';
import { categoryService } from '@/lib/services/category';
import type { Category } from '@/lib/types/database';
import { Smile } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// Predefined emoji collection untuk kategori
const CATEGORY_EMOJIS = [
    '🎬', '🎥', '📺', '🎭', '🎪', '🎨',
    '🎮', '🎯', '🎲', '🎰', '🎳', '🎹',
    '🏆', '⚽', '🏀', '🏈', '⚾', '🎾',
    '🎬', '📽️', '🎞️', '📹', '📱', '💻',
    '🌟', '⭐', '✨', '💫', '🔥', '❤️',
    '👑', '🎯', '🎪', '🎨', '🎭', '🎬',
    '📚', '📖', '📰', '📡', '📻', '📺',
    '🌍', '🌎', '🌏', '🗺️', '🧭', '⛰️',
    '🎃', '🎄', '🎆', '🎇', '🎉', '🎊',
    '🔔', '🔕', '📢', '📣', '📯', '🔊',
];

export default function KategoriPage() {
    const [showModal, setShowModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState('');
    const [editData, setEditData] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const toast = useToast();

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err: any) {
            toast.error(err.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const payload = {
            name: formData.get('name') as string,
            icon_url: formData.get('icon_url') as string || null,
            status: formData.get('status') as 'Active' | 'Not-Active',
        };

        try {
            if (editData) {
                await categoryService.update(editData.id, payload);
                toast.success('Kategori berhasil diupdate');
            } else {
                await categoryService.create(payload);
                toast.success('Kategori berhasil ditambahkan');
            }
            await fetchCategories();
            setShowModal(false);
            setEditData(null);
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyimpan data');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await categoryService.delete(deleteId);
            await fetchCategories();
            toast.success('Kategori berhasil dihapus');
        } catch (err: any) {
            toast.error(err.message || 'Gagal menghapus data');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setSelectedEmoji(emoji);
        setShowEmojiPicker(false);
    };

    const handleOpenModal = (data: Category | null = null) => {
        setEditData(data);
        setSelectedEmoji(data?.icon_url || '');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditData(null);
        setSelectedEmoji('');
        setShowEmojiPicker(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kategori</h1>
                    <p className="text-gray-400 mt-1">Kelola kategori streaming</p>
                </div>
                <button onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Kategori
                </button>
            </div>

            <div className="relative max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Cari kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-red-600" />
            </div>

            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm border-b border-zinc-800 bg-zinc-900/50">
                                <th className="px-6 py-4 font-medium">#</th>
                                <th className="px-6 py-4 font-medium">Icon</th>
                                <th className="px-6 py-4 font-medium">Nama</th>
                                <th className="px-6 py-4 font-medium">Slug</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data kategori
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat, index) => (
                                    <tr key={cat.id} className="hover:bg-zinc-800/50 transition">
                                        <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4 text-2xl">{cat.icon_url || '📁'}</td>
                                        <td className="px-6 py-4 text-white font-medium">{cat.name}</td>
                                        <td className="px-6 py-4"><code className="text-gray-400 bg-zinc-900 px-2 py-1 rounded text-sm">{cat.slug}</code></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{cat.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-lg">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => setDeleteId(cat.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                message="Apakah Anda yakin ingin menghapus kategori ini? Semua streaming dalam kategori ini mungkin terpengaruh."
                confirmText="Ya, Hapus"
                type="danger"
                loading={deleting}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={handleCloseModal}></div>
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold text-white">{editData ? 'Edit' : 'Tambah'} Kategori</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nama</label>
                                <input type="text" name="name" defaultValue={editData?.name} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600" />
                            </div>

                            {/* Emoji Picker */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Icon (Emoji)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="icon_url"
                                        value={selectedEmoji}
                                        onChange={(e) => setSelectedEmoji(e.target.value)}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600 text-2xl"
                                        placeholder="🎬"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded-lg transition flex items-center gap-2"
                                    >
                                        <Smile className="w-5 h-5 text-white" />
                                        <span className="text-white text-sm">Pilih</span>
                                    </button>
                                </div>

                                {/* Emoji Picker Dropdown */}
                                {showEmojiPicker && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-4 shadow-xl z-10 max-h-64 overflow-y-auto">
                                        <div className="grid grid-cols-6 gap-2">
                                            {CATEGORY_EMOJIS.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleEmojiSelect(emoji)}
                                                    className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-zinc-700 rounded-lg transition"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select name="status" defaultValue={editData?.status || 'Active'} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600">
                                    <option value="Active">Active</option>
                                    <option value="Not-Active">Not-Active</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    {editData ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
