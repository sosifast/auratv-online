"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Video, ExternalLink, ChevronDown, X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Playlist {
    id: string;
    id_streaming: string;
    url_streaming: string;
    type_streaming: 'mp4' | 'm3u8' | 'ts';
    name_server?: string;
    status: 'Active' | 'Not-Active';
    streaming?: {
        name: string;
        slug: string;
    };
}

interface Streaming {
    id: string;
    name: string;
    slug: string;
}

// Searchable Select Component
function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih...',
    searchPlaceholder = 'Cari...'
}: {
    options: Streaming[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            {/* Selected Value Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            >
                <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {selectedOption && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 hover:bg-zinc-700 rounded transition cursor-pointer"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-white" />
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-zinc-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full bg-zinc-900 border border-zinc-600 rounded-lg py-2 pl-9 pr-4 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                Tidak ada hasil untuk "{search}"
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-zinc-700 transition cursor-pointer ${
                                        value === opt.id ? 'bg-red-600/20 text-red-400' : 'text-white'
                                    }`}
                                >
                                    <div>
                                        <p className="font-medium">{opt.name}</p>
                                        <p className="text-xs text-gray-500">/{opt.slug}</p>
                                    </div>
                                    {value === opt.id && (
                                        <Check className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PlaylistPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [streamings, setStreamings] = useState<Streaming[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
        const [deleteId, setDeleteId] = useState<string | null>(null);
        const [deleting, setDeleting] = useState(false);
        const [saving, setSaving] = useState(false);
        const toast = useToast();

    const [formData, setFormData] = useState({
        id_streaming: '',
        url_streaming: '',
        type_streaming: 'mp4' as 'mp4' | 'm3u8' | 'ts',
        name_server: '',
        status: 'Active' as 'Active' | 'Not-Active'
    });

    useEffect(() => {
        fetchPlaylists();
        fetchStreamings();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setIsLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from('streaming_playlist')
                .select('*, streaming:id_streaming(name, slug)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlaylists(data || []);
        } catch (err) {
            console.error('Error fetching playlists:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStreamings = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('streaming')
                .select('id, name, slug')
                .eq('status', 'Active')
                .order('name');

            if (error) throw error;
            setStreamings(data || []);
        } catch (err) {
            console.error('Error fetching streamings:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const supabase = createClient();

            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('streaming_playlist')
                    .update(formData)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Playlist berhasil diupdate');
            } else {
                // Create
                const { error } = await supabase
                    .from('streaming_playlist')
                    .insert(formData);

                if (error) throw error;
                toast.success('Playlist berhasil ditambahkan');
            }

            resetForm();
            fetchPlaylists();
        } catch (err: any) {
            console.error('Error saving playlist:', err);
            toast.error(err.message || 'Gagal menyimpan playlist');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (playlist: Playlist) => {
        setEditingId(playlist.id);
        setFormData({
            id_streaming: playlist.id_streaming,
            url_streaming: playlist.url_streaming,
            type_streaming: playlist.type_streaming,
            name_server: playlist.name_server || '',
            status: playlist.status
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('streaming_playlist')
                .delete()
                .eq('id', deleteId);

            if (error) throw error;
            toast.success('Playlist berhasil dihapus');
            fetchPlaylists();
        } catch (err: any) {
            console.error('Error deleting playlist:', err);
            toast.error(err.message || 'Gagal menghapus playlist');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const resetForm = () => {
        setFormData({
            id_streaming: '',
            url_streaming: '',
            type_streaming: 'mp4',
            name_server: '',
            status: 'Active'
        });
        setEditingId(null);
        setShowModal(false);
    };

    const filteredPlaylists = playlists.filter(playlist => {
        const matchesSearch = playlist.streaming?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            playlist.url_streaming.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || playlist.type_streaming === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Playlist Streaming</h1>
                    <p className="text-gray-400 mt-1">Kelola playlist video untuk setiap streaming</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Playlist
                </button>
            </div>

            {/* Filters */}
            <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari playlist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="mp4">MP4</option>
                            <option value="m3u8">M3U8</option>
                            <option value="ts">TS</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total Playlist</p>
                    <p className="text-2xl font-bold text-white">{playlists.length}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-green-400">{playlists.filter(p => p.status === 'Active').length}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">MP4</p>
                    <p className="text-2xl font-bold text-blue-400">{playlists.filter(p => p.type_streaming === 'mp4').length}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">M3U8/HLS</p>
                    <p className="text-2xl font-bold text-purple-400">{playlists.filter(p => p.type_streaming === 'm3u8').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-800/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Streaming</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredPlaylists.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data playlist
                                    </td>
                                </tr>
                            ) : (
                                filteredPlaylists.map((playlist) => (
                                    <tr key={playlist.id} className="hover:bg-zinc-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Video className="w-4 h-4 text-red-500" />
                                                <span className="text-white font-medium">{playlist.streaming?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={playlist.url_streaming}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 max-w-md truncate"
                                            >
                                                <span className="truncate">{playlist.url_streaming}</span>
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${playlist.type_streaming === 'mp4' ? 'bg-blue-500/20 text-blue-400' :
                                                playlist.type_streaming === 'm3u8' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {playlist.type_streaming.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${playlist.status === 'Active'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {playlist.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(playlist)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(playlist.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Playlist"
                message="Apakah Anda yakin ingin menghapus playlist ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                type="danger"
                loading={deleting}
            />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-lg max-w-2xl w-full p-6">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingId ? 'Edit Playlist' : 'Tambah Playlist'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Streaming Select with Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Pilih Streaming
                                </label>
                                <SearchableSelect
                                    options={streamings}
                                    value={formData.id_streaming}
                                    onChange={(value) => setFormData({ ...formData, id_streaming: value })}
                                    placeholder="Pilih Streaming..."
                                    searchPlaceholder="Cari streaming..."
                                />
                                {!formData.id_streaming && (
                                    <input type="hidden" name="id_streaming" required />
                                )}
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL Streaming
                                </label>
                                <input
                                    type="url"
                                    value={formData.url_streaming}
                                    onChange={(e) => setFormData({ ...formData, url_streaming: e.target.value })}
                                    placeholder="https://example.com/video.mp4"
                                    required
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Contoh: https://cdn.example.com/video.mp4 atau https://stream.example.com/playlist.m3u8
                                </p>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tipe Streaming
                                </label>
                                <select
                                    value={formData.type_streaming}
                                    onChange={(e) => setFormData({ ...formData, type_streaming: e.target.value as any })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                >
                                    <option value="mp4">MP4 (Progressive)</option>
                                    <option value="m3u8">M3U8 (HLS)</option>
                                    <option value="ts">TS (Transport Stream)</option>
                                </select>
                            </div>

                            {/* Name Server */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Server
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_server}
                                    onChange={(e) => setFormData({ ...formData, name_server: e.target.value })}
                                    placeholder="Server 1, Cloudflare CDN, Google Drive, etc."
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Opsional: Nama server/sumber streaming untuk memudahkan identifikasi
                                </p>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Not-Active">Not Active</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving || !formData.id_streaming}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {editingId ? 'Update' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={saving}
                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
