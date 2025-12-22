// =============================================
// AURATV DATABASE TYPES
// Auto-generated types for Supabase tables
// =============================================

export type UserLevel = 'Member' | 'Admin';
export type UserStatus = 'Active' | 'Not-Active' | 'Suspend';
export type GeneralStatus = 'Active' | 'Not-Active';

// =============================================
// 1. USERS
// =============================================
export interface User {
    id: string;
    full_name: string;
    email: string;
    password: string;
    level: UserLevel;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}

export interface UserInsert {
    id?: string;
    full_name: string;
    email: string;
    password: string;
    level?: UserLevel;
    status?: UserStatus;
    created_at?: string;
    updated_at?: string;
}

export interface UserUpdate {
    full_name?: string;
    email?: string;
    password?: string;
    level?: UserLevel;
    status?: UserStatus;
    updated_at?: string;
}

// =============================================
// 2. CATEGORY
// =============================================
export interface Category {
    id: string;
    name: string;
    icon_url: string | null;
    slug: string;
    status: GeneralStatus;
    created_at: string;
    updated_at: string;
}

export interface CategoryInsert {
    id?: string;
    name: string;
    icon_url?: string | null;
    slug: string;
    status?: GeneralStatus;
    created_at?: string;
    updated_at?: string;
}

export interface CategoryUpdate {
    name?: string;
    icon_url?: string | null;
    slug?: string;
    status?: GeneralStatus;
    updated_at?: string;
}

// =============================================
// 3. STREAMING
// =============================================
export interface Streaming {
    id: string;
    id_category: string;
    slug: string;
    name: string;
    description: string | null;
    title_seo: string | null;
    desc_seo: string | null;
    url_banner: string | null;
    view_count: number;
    status: GeneralStatus;
    created_at: string;
    updated_at: string;
}

export interface StreamingInsert {
    id?: string;
    id_category: string;
    slug: string;
    name: string;
    description?: string | null;
    title_seo?: string | null;
    desc_seo?: string | null;
    url_banner?: string | null;
    view_count?: number;
    status?: GeneralStatus;
    created_at?: string;
    updated_at?: string;
}

export interface StreamingUpdate {
    id_category?: string;
    slug?: string;
    name?: string;
    description?: string | null;
    title_seo?: string | null;
    desc_seo?: string | null;
    url_banner?: string | null;
    view_count?: number;
    status?: GeneralStatus;
    updated_at?: string;
}

// Streaming with category info (from view)
export interface StreamingWithCategory extends Streaming {
    category_name: string;
    category_slug: string;
    category_icon: string | null;
}

// =============================================
// 4. STREAMING_PLAYLIST
// =============================================
export type StreamingType = 'mp4' | 'm3u8' | 'ts';

export interface StreamingPlaylist {
    id: string;
    id_streaming: string;
    url_streaming: string;
    type_streaming: StreamingType;
    status: GeneralStatus;
    created_at: string;
    updated_at: string;
}

export interface StreamingPlaylistInsert {
    id?: string;
    id_streaming: string;
    url_streaming: string;
    type_streaming?: StreamingType;
    status?: GeneralStatus;
    created_at?: string;
    updated_at?: string;
}

export interface StreamingPlaylistUpdate {
    id_streaming?: string;
    url_streaming?: string;
    type_streaming?: StreamingType;
    status?: GeneralStatus;
    updated_at?: string;
}

// =============================================
// 5. SETTINGS
// =============================================
export interface Settings {
    id: string;
    name_site: string;
    favicon_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface SettingsInsert {
    id?: string;
    name_site?: string;
    favicon_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface SettingsUpdate {
    name_site?: string;
    favicon_url?: string | null;
    updated_at?: string;
}

// =============================================
// DATABASE SCHEMA TYPE
// =============================================
export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: UserInsert;
                Update: UserUpdate;
            };
            category: {
                Row: Category;
                Insert: CategoryInsert;
                Update: CategoryUpdate;
            };
            streaming: {
                Row: Streaming;
                Insert: StreamingInsert;
                Update: StreamingUpdate;
            };
            streaming_playlist: {
                Row: StreamingPlaylist;
                Insert: StreamingPlaylistInsert;
                Update: StreamingPlaylistUpdate;
            };
            settings: {
                Row: Settings;
                Insert: SettingsInsert;
                Update: SettingsUpdate;
            };
        };
        Views: {
            streaming_with_category: {
                Row: StreamingWithCategory;
            };
            popular_streaming: {
                Row: Streaming;
            };
        };
    };
}
