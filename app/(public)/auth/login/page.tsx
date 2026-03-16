"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageSquare, Star, ThumbsUp, Zap } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setPending(false);
      setErr(error.message);
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      setPending(false);
      setErr("Failed to get session");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name,last_name,date_of_birth")
      .eq("id", user.id)
      .maybeSingle();

    const incomplete =
      !profile ||
      !profile.first_name?.trim() ||
      !profile.last_name?.trim() ||
      !profile.date_of_birth;

    setPending(false);
    router.replace(incomplete ? "/onboarding" : "/");
  }

  return (
    <div className="min-h-dvh flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#55adfe] to-blue-700 flex-col justify-between p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-xl">Feedbackami</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Your users have things<br />to say. Listen to them.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Collect, organize, and act on feedback — all in one place.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: <MessageSquare className="size-4" />, text: "Centralize feedback from all channels" },
              { icon: <ThumbsUp className="size-4" />, text: "Let users vote on what matters most" },
              { icon: <Zap className="size-4" />, text: "Ship features your users actually want" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-blue-50">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-blue-100 text-sm">
          <Star size={14} className="fill-blue-100" />
          Trusted by 500+ product teams worldwide
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50/40 to-white">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#55adfe] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Feedbackami</span>
          </Link>

          {verified && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="size-4 mt-0.5 shrink-0 text-green-500" />
              <span>Your account is ready — please sign in to continue.</span>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#55adfe]/40 focus:border-[#55adfe] transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#55adfe]/40 focus:border-[#55adfe] transition"
              />
            </div>

            {err && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#55adfe] hover:bg-[#3d9fee] text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-colors disabled:opacity-60"
            >
              {pending ? "Signing in…" : (
                <>Sign In <ArrowRight className="size-4" /></>
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-[#55adfe] font-medium hover:underline">
                Sign up free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
