"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface DashboardStats {
    totalStreaming: number;
    totalViews: number;
    totalUsers: number;
    totalCategories: number;
}

interface RecentStreaming {
    id: string;
    name: string;
    category: { name: string } | null;
    view_count: number;
    status: string;
}

interface RecentUser {
    id: string;
    full_name: string;
    email: string;
    level: string;
    status: string;
}

async function getDashboardStats(): Promise<DashboardStats> {
    const [streamingRes, usersRes, categoriesRes] = await Promise.all([
        supabase.from('streaming').select('view_count'),
        supabase.from('users').select('id'),
        supabase.from('category').select('id')
    ]);

    const totalStreaming = streamingRes.data?.length || 0;
    const totalViews = (streamingRes.data as { view_count: number }[])?.reduce((sum: number, s) => sum + (s.view_count || 0), 0) || 0;
    const totalUsers = usersRes.data?.length || 0;
    const totalCategories = categoriesRes.data?.length || 0;

    return { totalStreaming, totalViews, totalUsers, totalCategories };
}

async function getRecentStreamings(): Promise<RecentStreaming[]> {
    const { data } = await supabase
        .from('streaming')
        .select('id, name, view_count, status, category:id_category(name)')
        .order('created_at', { ascending: false })
        .limit(5);
    return data || [];
}

async function getRecentUsers(): Promise<RecentUser[]> {
    const { data } = await supabase
        .from('users')
        .select('id, full_name, email, level, status')
        .order('created_at', { ascending: false })
        .limit(5);
    return data || [];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ totalStreaming: 0, totalViews: 0, totalUsers: 0, totalCategories: 0 });
    const [recentStreaming, setRecentStreaming] = useState<RecentStreaming[]>([]);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, streamingData, usersData] = await Promise.all([
                    getDashboardStats(),
                    getRecentStreamings(),
                    getRecentUsers()
                ]);
                setStats(statsData);
                setRecentStreaming(streamingData);
                setRecentUsers(usersData);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const statCards = [
        { name: 'Total Streaming', value: stats.totalStreaming.toLocaleString(), icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'from-blue-600 to-blue-700' },
        { name: 'Total Views', value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'from-emerald-600 to-emerald-700' },
        { name: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-purple-600 to-purple-700' },
        { name: 'Kategori', value: stats.totalCategories.toLocaleString(), icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'from-orange-600 to-orange-700' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Selamat datang kembali, Admin!</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-gray-500 text-sm">{stat.name}</p>
                    </div>
                ))}
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Streaming */}
                <div className="lg:col-span-2 bg-zinc-800/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                        <h2 className="text-lg font-semibold text-white">Streaming Terbaru</h2>
                        <Link href="/admin/streaming" className="text-sm text-red-500 hover:text-red-400 transition">
                            Lihat Semua →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b border-zinc-800">
                                    <th className="px-6 py-4 font-medium">Nama</th>
                                    <th className="px-6 py-4 font-medium">Kategori</th>
                                    <th className="px-6 py-4 font-medium">Views</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {recentStreaming.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada data</td></tr>
                                ) : (
                                    recentStreaming.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-800/50 transition">
                                            <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                                            <td className="px-6 py-4 text-gray-400">{item.category?.name || '-'}</td>
                                            <td className="px-6 py-4 text-gray-400">{item.view_count.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                        <h2 className="text-lg font-semibold text-white">Users Terbaru</h2>
                        <Link href="/admin/users" className="text-sm text-red-500 hover:text-red-400 transition">Lihat →</Link>
                    </div>
                    <div className="p-4 space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Belum ada data</p>
                        ) : (
                            recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{user.full_name}</p>
                                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${user.level === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {user.level}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link href="/admin/streaming" className="flex flex-col items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-red-600 hover:bg-red-600/5 transition group">
                        <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center group-hover:bg-red-600/20 transition">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-white transition">Tambah Streaming</span>
                    </Link>
                    <Link href="/admin/kategori" className="flex flex-col items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-blue-600 hover:bg-blue-600/5 transition group">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center group-hover:bg-blue-600/20 transition">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-white transition">Tambah Kategori</span>
                    </Link>
                    <Link href="/admin/users" className="flex flex-col items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-600 hover:bg-purple-600/5 transition group">
                        <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center group-hover:bg-purple-600/20 transition">
                            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-white transition">Tambah User</span>
                    </Link>
                    <Link href="/admin/settings" className="flex flex-col items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-orange-600 hover:bg-orange-600/5 transition group">
                        <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center group-hover:bg-orange-600/20 transition">
                            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-white transition">Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
