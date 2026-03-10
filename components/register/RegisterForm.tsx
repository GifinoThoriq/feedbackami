"use client";

import { registerAction } from "@/app/actions/registerActions";
import { RegisterInput, registerSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, Eye, Mail, ArrowRight, MessageSquare, ThumbsUp, Zap, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function RegisterForm() {
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [isConfirmPassOpen, setIsConfirmPassOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isConfModal, setIsConfModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    setSuccess(null);
    const res = await registerAction(values);
    if (!res.ok) {
      setFormError(res.error);
      setErrorModal(true);
    } else {
      setSuccess("Check your email for the verification link.");
      setIsConfModal(true);
    }
  };

  const pwd = watch("password") || "";
  const strength = Math.min(
    4,
    Number(/[a-z]/.test(pwd)) +
      Number(/[A-Z]/.test(pwd)) +
      Number(/\d/.test(pwd)) +
      Number(pwd.length >= 12)
  );

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor =
    strength <= 1 ? "#ef4444" : strength === 2 ? "#f59e0b" : strength === 3 ? "#10b981" : "#22c55e";

  return (
    <>
      {/* ERROR MODAL */}
      <Dialog open={errorModal} onOpenChange={setErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">Unable to Sign Up</DialogTitle>
            <DialogDescription className="text-sm">{formError}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* EMAIL CONFIRMATION MODAL */}
      <Dialog open={isConfModal}>
        <DialogContent>
          <DialogHeader className="items-center">
            <div className="p-4 rounded-full bg-blue-50 border border-blue-100">
              <Mail className="size-8 text-[#55adfe]" />
            </div>
          </DialogHeader>
          <DialogTitle className="text-lg text-center">Check your inbox</DialogTitle>
          <DialogDescription className="text-sm text-center">
            We sent a confirmation link to{" "}
            <span className="text-gray-900 font-medium">{email}</span>. Follow
            the link to complete your registration.
          </DialogDescription>
        </DialogContent>
      </Dialog>

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
              Start building with<br />your users, not for them.
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-10">
              Set up your feedback board in minutes and start collecting insights today.
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

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-500 mt-2">Free forever. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-address" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email-address"
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#55adfe]/40 focus:border-[#55adfe] transition"
                  {...register("email")}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={isPassOpen ? "text" : "password"}
                    placeholder="Min. 12 characters"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#55adfe]/40 focus:border-[#55adfe] transition"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPassOpen(!isPassOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {isPassOpen ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                  </button>
                </div>
                {pwd.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(strength / 4) * 100}%`, background: strengthColor }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password_confirm" className="text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="password_confirm"
                    type={isConfirmPassOpen ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#55adfe]/40 focus:border-[#55adfe] transition"
                    {...register("passwordConfirm")}
                    aria-invalid={!!errors.passwordConfirm}
                  />
                  <button
                    type="button"
                    onClick={() => setIsConfirmPassOpen(!isConfirmPassOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {isConfirmPassOpen ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                  </button>
                </div>
                {errors.passwordConfirm && (
                  <p className="text-xs text-red-600">{errors.passwordConfirm.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#55adfe] hover:bg-[#3d9fee] text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-colors disabled:opacity-60 mt-1"
              >
                {isSubmitting ? "Creating account…" : (
                  <>Create account <ArrowRight className="size-4" /></>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#55adfe] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
