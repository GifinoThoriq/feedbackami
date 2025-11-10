// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedPath = (pathname: string) => {
  // mark only the sections that require auth
  return pathname.startsWith("/dashboard");
};

export async function updateSession(request: NextRequest) {
  // Early exits to avoid loops
  const { pathname } = request.nextUrl;

  // NEVER block or change auth/callback, auth pages, public assets, or api routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // read from incoming request
        getAll() {
          return request.cookies.getAll();
        },
        // write ONLY to the response (do NOT mutate request or create new NextResponse)
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This may refresh the session (which writes cookies via setAll)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate only protected paths
  if (!user && isProtectedPath(pathname)) {
    // prevent self-redirect loops: if we're already on /auth/login, don't redirect again
    const loginPath = "/auth/login";
    if (pathname !== loginPath) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      url.search = ""; // optional: strip search params to avoid bouncing
      return NextResponse.redirect(url);
    }
  }

  return response;
}
