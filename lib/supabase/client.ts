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
        !supabaseUrl.includes('your-project-id') &&
        supabaseAnonKey.length > 20
    );
}

// Mock data for demo mode
const mockCategories = [
    { id: '1', name: 'Action', slug: 'action', icon_url: '🎬' },
    { id: '2', name: 'Drama', slug: 'drama', icon_url: '🎭' },
    { id: '3', name: 'Comedy', slug: 'comedy', icon_url: '😂' },
    { id: '4', name: 'Horror', slug: 'horror', icon_url: '👻' },
];

const mockStreamings = [
    {
        id: '1',
        name: 'The Dark Knight',
        slug: 'dark-knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        url_banner: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1920',
        view_count: 5000,
        id_category: '1',
        category: { name: 'Action', slug: 'action' }
    },
    {
        id: '2',
        name: 'Inception',
        slug: 'inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        url_banner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920',
        view_count: 4500,
        id_category: '1',
        category: { name: 'Action', slug: 'action' }
    },
    {
        id: '3',
        name: 'The Shawshank Redemption',
        slug: 'shawshank',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        url_banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920',
        view_count: 3000,
        id_category: '2',
        category: { name: 'Drama', slug: 'drama' }
    }
];

// Mock client for when Supabase is not configured
const mockClient = {
    from: (table: string) => ({
        select: (columns?: string) => ({
            data: table === 'category' ? mockCategories : table === 'streaming' ? mockStreamings : [],
            error: null,
            order: (column: string, options?: any) => ({
                data: table === 'category' ? mockCategories : table === 'streaming' ? mockStreamings : [],
                error: null,
                limit: (count: number) => ({
                    data: table === 'category' ? mockCategories : table === 'streaming' ? mockStreamings : [],
                    error: null,
                    single: () => ({
                        data: table === 'streaming' ? mockStreamings[0] : null,
                        error: null
                    })
                }),
                single: () => ({
                    data: table === 'streaming' ? mockStreamings[0] : null,
                    error: null
                })
            }),
            eq: (column: string, value: any) => ({
                data: table === 'category' ? mockCategories.filter(c => (c as any)[column] === value) :
                    table === 'streaming' ? mockStreamings.filter(s => (s as any)[column] === value) : [],
                error: null,
                order: (col: string, opts?: any) => ({
                    data: table === 'streaming' ? mockStreamings.filter(s => (s as any)[column] === value) : [],
                    error: null
                }),
                single: () => ({
                    data: table === 'category' ? mockCategories.find(c => (c as any)[column] === value) :
                        table === 'streaming' ? mockStreamings.find(s => (s as any)[column] === value) : null,
                    error: null
                }),
                neq: (col: string, val: any) => ({
                    limit: (count: number) => ({ data: [], error: null })
                })
            }),
            limit: (count: number) => ({
                data: table === 'streaming' ? mockStreamings.slice(0, count) : [],
                error: null,
                single: () => ({
                    data: table === 'streaming' ? mockStreamings[0] : null,
                    error: null
                })
            }),
            single: () => ({
                data: table === 'streaming' ? mockStreamings[0] : null,
                error: null
            })
        }),
        insert: (data: any) => ({
            select: () => ({
                single: () => {
                    // Simulate successful insertion for demo
                    console.log('Demo Mode: Simulating insertion into', table, data);
                    return { data: { ...data, id: 'demo-' + Math.random().toString(36).substr(2, 9) }, error: null };
                }
            })
        }),
        update: (data: any) => ({
            eq: (column: string, value: any) => ({
                select: () => ({
                    single: () => ({ data: { ...data, id: value }, error: null })
                })
            })
        }),
        delete: () => ({
            eq: (column: string, value: any) => ({ error: null })
        })
    }),
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({
            data: { user: { id: 'demo-user', email: 'demo@example.com' }, session: {} },
            error: null
        }),
        signUp: async (data: any) => ({
            data: { user: { id: 'demo-user', email: data.email }, session: {} },
            error: null
        }),
        signOut: async () => ({ error: null }),
    },
    rpc: (fn: string, params?: any) => Promise.resolve({ data: [], error: null }),
};

export function createClient() {
    // Return mock if not configured
    if (!isConfigured()) {
        if (typeof window !== 'undefined') {
            // Only log once in browser
            (window as any)._supabaseWarned = (window as any)._supabaseWarned || false;
            if (!(window as any)._supabaseWarned) {
                console.warn('⚠️ Supabase not configured. Running in Demo Mode.');
                (window as any)._supabaseWarned = true;
            }
        }
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
