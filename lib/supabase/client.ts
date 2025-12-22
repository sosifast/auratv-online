import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

// Check if Supabase is configured
function isConfigured(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return !!(
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl.startsWith('https://') &&
        supabaseAnonKey.length > 20
    );
}

// Mock client for when Supabase is not configured
const mockClient = {
    from: (table: string) => ({
        select: (columns?: string) => ({
            data: [],
            error: null,
            order: (column: string, options?: any) => ({
                data: [],
                error: null,
                limit: (count: number) => ({
                    data: [],
                    error: null,
                    single: () => ({ data: null, error: null })
                }),
                single: () => ({ data: null, error: null })
            }),
            eq: (column: string, value: any) => ({
                data: [],
                error: null,
                order: (col: string, opts?: any) => ({ data: [], error: null }),
                single: () => ({ data: null, error: null }),
                neq: (col: string, val: any) => ({
                    limit: (count: number) => ({ data: [], error: null })
                })
            }),
            neq: (column: string, value: any) => ({
                limit: (count: number) => ({ data: [], error: null })
            }),
            limit: (count: number) => ({
                data: [],
                error: null,
                single: () => ({ data: null, error: null })
            }),
            single: () => ({ data: null, error: null })
        }),
        insert: (data: any) => ({
            select: () => ({
                single: () => ({ data: null, error: { message: 'Supabase not configured' } })
            })
        }),
        update: (data: any) => ({
            eq: (column: string, value: any) => ({
                select: () => ({
                    single: () => ({ data: null, error: { message: 'Supabase not configured' } })
                })
            })
        }),
        delete: () => ({
            eq: (column: string, value: any) => ({ error: { message: 'Supabase not configured' } })
        })
    }),
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
    },
    rpc: (fn: string, params?: any) => Promise.resolve({ error: null }),
};

export function createClient() {
    // Return mock if not configured
    if (!isConfigured()) {
        console.warn('⚠️ Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
        return mockClient as any;
    }

    // Create singleton instance
    if (!supabaseInstance) {
        supabaseInstance = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }

    return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
    return isConfigured();
}
