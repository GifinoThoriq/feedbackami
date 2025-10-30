"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setPending(false);
      setErr(error.message);
      return;
    }

    // check profile completeness
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
    <>
      <div className="min-h-dvh items-center justify-center flex flex-col w-full">
        <div className="text-center mb-12">
          <h1 className="font-bold text-3xl">Sign in to Feedbackami</h1>
          <h4 className="font-light text-gray-400 text-md mt-2">
            Welcome back! Please sign in to continue
          </h4>
        </div>

        <form onSubmit={onSubmit} className="w-full text-sm">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto px-6">
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="border p-2 border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="email">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="border p-2 border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="col-span-2 mt-4">
              <button
                type="submit"
                disabled={pending}
                className="bg-gray-800 text-white w-full p-2.5 rounded-lg hover:bg-gray-700 font-bold"
              >
                {pending ? "Signing in…" : "Sign In"}
              </button>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  className="text-gray-900 hover:underline"
                  href={"/auth/register"}
                >
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
