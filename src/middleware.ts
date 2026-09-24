import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";

function isAdminRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Refresh the session. getClaims() validates the JWT without trusting
  // unverified cookie data.
  const { data: claimsData } = await supabase.auth.getClaims();

  let userEmail: string | undefined;
  if (claimsData?.claims?.email) {
    userEmail = claimsData.claims.email as string;
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? undefined;
  }

  // Protect admin routes — only the configured admin email may access them.
  if (isAdminRoute(request.nextUrl.pathname) && !isAdmin(userEmail)) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
