"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { saveOnboardingProfileAction } from "@/app/actions/profileActions";
import { ProfileInput, profileSchema } from "@/lib/validation/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: ProfileInput) => {
    setError(null);
    const res = await saveOnboardingProfileAction(values);
    if (!res.ok) {
      setError(res.error);
      return;
    } else {
      redirect("/dashboard");
    }
  };

  return (
    <>
      <div className="min-h-dvh items-center justify-center flex flex-col w-full">
        <div className="text-start mb-12 max-w-lg w-full px-6">
          <h1 className="font-bold text-3xl">Finish up your profile</h1>
          <h4 className="font-light text-gray-400 text-md mt-2">
            Personalize your experience
          </h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full text-sm">
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto px-6">
            <div className="flex flex-col gap-2 col-span-1">
              <label htmlFor="first-name">First Name</label>
              <input
                className="border p-2 border-gray-300 rounded-lg"
                id="first-name"
                placeholder="First Name"
                {...register("firstName")}
                aria-invalid={!!errors.firstName}
              ></input>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-1">
              <label htmlFor="last-name">Last Name</label>
              <input
                className="border p-2 border-gray-300 rounded-lg"
                id="last-name"
                placeholder="Last Name"
                {...register("lastName")}
                aria-invalid={!!errors.lastName}
              ></input>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="birth-date">Birth Date</label>
              <input
                className="border p-2 border-gray-300 rounded-lg"
                id="last-name"
                type="date"
                placeholder="Last Name"
                {...register("dateOfBirth")}
                aria-invalid={!!errors.dateOfBirth}
              ></input>
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className="col-span-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 text-white w-full p-2.5 rounded-lg hover:bg-gray-700 font-bold"
              >
                {isSubmitting ? "Creating profile..." : "Continue"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
