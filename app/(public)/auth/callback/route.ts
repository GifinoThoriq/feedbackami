import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");

  if (error) {
    console.error("Auth callback error:", error, errorDesc);
    return NextResponse.redirect(new URL("/error", request.url));
  }

  if (code) {
    const supabase = createClient(cookies());
    try {
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(
        code
      );
      if (exchangeErr) {
        console.error("Exchange error:", exchangeErr.message);
        return NextResponse.redirect(
          new URL("/auth/login?verified=1", request.url)
        );
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    } catch (e) {
      console.error("Exchange threw:", e);
      return NextResponse.redirect(
        new URL("/auth/login?verified=1", request.url)
      );
    }
  }

  // No code present; go home or login
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
