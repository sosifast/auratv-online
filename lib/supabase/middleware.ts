import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Check if Supabase credentials are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Skip Supabase session update if credentials are not configured or are placeholder values
    if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl.includes('your-project') ||
        supabaseAnonKey.includes('your-anon-key')
    ) {
        // Return early without Supabase - app will work without auth
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // IMPORTANT: Avoid writing any logic between createServerClient and
        // supabase.auth.getUser(). A simple mistake could make it very hard to debug
        // issues with users being randomly logged out.

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // --- PROTECTED ROUTES LOGIC ---
        const isUrlAdmin = request.nextUrl.pathname.startsWith('/admin');
        const isUrlLogin = request.nextUrl.pathname.startsWith('/login');

        // 1. If trying to access admin area
        if (isUrlAdmin) {
            // Not logged in -> redirect to login
            if (!user) {
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
                return NextResponse.redirect(url);
            }

            // Logged in -> check level
            const { data: userData } = await supabase
                .from('users')
                .select('level')
                .eq('id', user.id)
                .single();

            // Not an admin -> redirect to home
            if (userData?.level !== 'Admin') {
                const url = request.nextUrl.clone();
                url.pathname = '/';
                return NextResponse.redirect(url);
            }
        }

        // 2. If already logged in and tries to go to login page -> redirect to dashboard/home
        if (user && isUrlLogin) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin'; // Or home
            return NextResponse.redirect(url);
        }
    } catch (error) {
        // If Supabase fails, continue without auth
        console.warn('Supabase session update failed:', error);
    }

    return supabaseResponse;
}
