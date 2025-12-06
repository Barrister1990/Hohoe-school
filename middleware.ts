import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/verify-email', '/change-password', '/forgot-password', '/reset-password', '/auth'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  );

  // If user is authenticated and on home page, redirect to appropriate dashboard
  if (user && request.nextUrl.pathname === '/') {
    try {
      // Fetch user role from database for correct redirect
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();
      
      if (userData?.role === 'admin') {
        const redirectUrl = new URL('/admin/dashboard', request.url);
        return NextResponse.redirect(redirectUrl);
      } else {
        // Default to teacher dashboard for class_teacher and subject_teacher
        const redirectUrl = new URL('/teacher/dashboard', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // If role fetch fails, default to teacher dashboard
      // Client-side will handle correct redirect if needed
      const redirectUrl = new URL('/teacher/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Allow public routes for unauthenticated users
  if (isPublicRoute) {
    return response;
  }

  // Protected routes - check authentication
  const protectedRoutes = ['/admin', '/teacher'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected route without authentication, redirect to home
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

