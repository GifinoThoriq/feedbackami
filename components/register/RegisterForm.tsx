"use client";

import { registerAction } from "@/app/actions/registerActions";
import { RegisterInput, registerSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, Eye, Mail } from "lucide-react";
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
    } else setSuccess("Check your email for the verification link.");
  };

  const pwd = watch("password") || "";
  const strength = Math.min(
    4,
    Number(/[a-z]/.test(pwd)) +
      Number(/[A-Z]/.test(pwd)) +
      Number(/\d/.test(pwd)) +
      Number(pwd.length >= 12)
  );

  return (
    <>
      {/* ERROR MESSAGE */}
      <Dialog open={errorModal} onOpenChange={setErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">Unable to Sign Up</DialogTitle>
            <DialogDescription className="text-sm">
              {formError}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* EMAIL CONFIRMATION */}
      <Dialog open={isConfModal}>
        <DialogContent>
          <DialogHeader className="items-center">
            <div className="p-4 rounded-full bg-gray-200">
              <Mail className="size-8"></Mail>
            </div>
          </DialogHeader>
          <DialogTitle className="text-lg text-center">
            Email Confirmation
          </DialogTitle>
          <DialogDescription className="text-sm">
            We have send email to <span className="text-black">{email}</span> to
            confirm the validity of our email address. After receiving the email
            follow the link provided to complete your registration
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <div className="min-h-dvh items-center justify-center flex flex-col w-full">
        <div className="text-center mb-12">
          <h1 className="font-bold text-3xl">
            Supercharge your business today
          </h1>
          <h4 className="font-light text-gray-400 text-md mt-2">
            Sign up to claim 1,000 free actions
          </h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full text-sm">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto px-6">
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="email-address">Email Address</label>
              <input
                className="border p-2 border-gray-300 rounded-lg"
                id="email-address"
                placeholder="Enter your email address"
                {...register("email")}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              ></input>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  className="border p-2 border-gray-300 rounded-lg w-full"
                  id="password"
                  type={isPassOpen ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                ></input>
                {isPassOpen ? (
                  <Eye
                    onClick={() => setIsPassOpen(false)}
                    className="absolute right-[10px] top-[50%] translate-y-[-50%] text-gray-400"
                  ></Eye>
                ) : (
                  <EyeClosed
                    onClick={() => setIsPassOpen(true)}
                    className="absolute right-[10px] top-[50%] translate-y-[-50%] text-gray-400"
                  ></EyeClosed>
                )}
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    background:
                      strength <= 1
                        ? "#ef4444"
                        : strength === 2
                        ? "#f59e0b"
                        : strength === 3
                        ? "#10b981"
                        : "#22c55e",
                  }}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="password_confirm">Password Confirmation</label>
              <div className="relative">
                <input
                  className="border p-2 border-gray-300 rounded-lg w-full"
                  id="password_confirm"
                  type={isConfirmPassOpen ? "text" : "password"}
                  {...register("passwordConfirm")}
                  aria-invalid={!!errors.passwordConfirm}
                  placeholder="Enter your password"
                ></input>
                {isConfirmPassOpen ? (
                  <Eye
                    onClick={() => setIsConfirmPassOpen(false)}
                    className="absolute right-[10px] top-[50%] translate-y-[-50%] text-gray-400"
                  ></Eye>
                ) : (
                  <EyeClosed
                    onClick={() => setIsConfirmPassOpen(true)}
                    className="absolute right-[10px] top-[50%] translate-y-[-50%] text-gray-400"
                  ></EyeClosed>
                )}
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>
            <div className="col-span-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 text-white w-full p-2.5 rounded-lg hover:bg-gray-700 font-bold"
              >
                {isSubmitting ? "Creating account..." : "Sign Up"}
              </button>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-gray-400">
                Have an account?{" "}
                <Link
                  className="text-gray-900 hover:underline"
                  href={"/auth/login"}
                >
                  Sign In
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
