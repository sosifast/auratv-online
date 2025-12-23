"use client";

import React, { useState, useEffect } from 'react';
import { streamingService } from '@/lib/services/streaming';
import { categoryService } from '@/lib/services/category';
import type { Category } from '@/lib/types/database';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function StreamingPage() {
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [streamings, setStreamings] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [streamingData, categoryData] = await Promise.all([
                streamingService.getAll(),
                categoryService.getAll()
            ]);
            setStreamings(streamingData);
            setCategories(categoryData);
        } catch (err: any) {
            toast.error(err.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const filteredStreamings = streamings.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const payload = {
            name: formData.get('name') as string,
            id_category: formData.get('id_category') as string,
            description: formData.get('description') as string || null,
            title_seo: formData.get('title_seo') as string || null,
            desc_seo: formData.get('desc_seo') as string || null,
            url_banner: formData.get('url_banner') as string || null,
            status: formData.get('status') as 'Active' | 'Not-Active',
        };

        try {
            if (editData) {
                await streamingService.update(editData.id, payload);
                toast.success('Streaming berhasil diupdate');
            } else {
                await streamingService.create(payload);
                toast.success('Streaming berhasil ditambahkan');
            }
            await fetchData();
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
            await streamingService.delete(deleteId);
            await fetchData();
            toast.success('Streaming berhasil dihapus');
        } catch (err: any) {
            toast.error(err.message || 'Gagal menghapus data');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Streaming</h1>
                    <p className="text-gray-400 mt-1">Kelola konten streaming</p>
                </div>
                <button onClick={() => { setEditData(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Streaming
                </button>
            </div>

            <div className="relative max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Cari streaming..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
                                <th className="px-6 py-4 font-medium">Nama</th>
                                <th className="px-6 py-4 font-medium">Kategori</th>
                                <th className="px-6 py-4 font-medium">Views</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredStreamings.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td></tr>
                            ) : (
                                filteredStreamings.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-zinc-800/50 transition">
                                        <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                                        <td className="px-6 py-4 text-gray-400">{item.category?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-400">{(item.view_count || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setEditData(item); setShowModal(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-lg">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => setDeleteId(item.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
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
                title="Hapus Streaming"
                message="Apakah Anda yakin ingin menghapus streaming ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                type="danger"
                loading={deleting}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold text-white">{editData ? 'Edit' : 'Tambah'} Streaming</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nama</label>
                                <input type="text" name="name" defaultValue={editData?.name} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
                                <select name="id_category" defaultValue={editData?.id_category || ''} required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600">
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
                                <textarea name="description" rows={3} defaultValue={editData?.description || ''} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600 resize-none" placeholder="Deskripsi singkat untuk konten..." />
                            </div>

                            {/* SEO Section */}
                            <div className="pt-4 border-t border-zinc-700">
                                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    SEO Optimization
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            SEO Title
                                            <span className="text-gray-500 text-xs ml-2">(Opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title_seo"
                                            defaultValue={editData?.title_seo || ''}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600"
                                            placeholder="Judul yang SEO-friendly (max 60 karakter)"
                                            maxLength={60}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Digunakan untuk meta title di search engine</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            SEO Description
                                            <span className="text-gray-500 text-xs ml-2">(Opsional)</span>
                                        </label>
                                        <textarea
                                            name="desc_seo"
                                            rows={3}
                                            defaultValue={editData?.desc_seo || ''}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600 resize-none"
                                            placeholder="Deskripsi meta untuk search engine (max 160 karakter)"
                                            maxLength={160}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Muncul di hasil pencarian Google/Bing</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">URL Banner</label>
                                <input type="text" name="url_banner" defaultValue={editData?.url_banner || ''} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600" placeholder="https://..." />
                                <p className="text-xs text-gray-500 mt-1">URL gambar poster/thumbnail</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select name="status" defaultValue={editData?.status || 'Active'} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600">
                                    <option value="Active">Active</option>
                                    <option value="Not-Active">Not-Active</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">Batal</button>
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
