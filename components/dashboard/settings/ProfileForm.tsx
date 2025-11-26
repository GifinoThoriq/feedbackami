"use client";

import { saveOnboardingProfileAction } from "@/app/actions/profileActions";
import { Button } from "@/components/ui/button";
import { GradientColor } from "@/lib/color";
import { ProfileInput, profileSchema } from "@/lib/validation/profile";
import {
  ProfileRecord,
  useProfileStore,
} from "@/lib/stores/useProfileStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";

interface IProps {
  profile: ProfileRecord | null;
}

export default function ProfileForm({ profile }: IProps) {
  const router = useRouter();
  const hydrateProfile = useProfileStore((state) => state.hydrate);
  const updateProfileInStore = useProfileStore(
    (state) => state.updateFromForm
  );
  const gradientList = GradientColor;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      profile_color: gradientList[0],
      dateOfBirth: "",
    },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  useEffect(() => {
    hydrateProfile(profile ?? null);
    if (!profile) {
      return;
    }

    reset({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      profile_color: profile.profile_color ?? gradientList[0],
      dateOfBirth: profile.date_of_birth ?? "",
    });
  }, [gradientList, hydrateProfile, profile, reset]);

  const onSubmit = async (values: ProfileInput) => {
    const res = await saveOnboardingProfileAction(values);
    if (!res.ok) {
      console.log(res.error);
      return;
    } else {
      updateProfileInStore(values);
      router.push("/dashboard");
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full text-sm mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 col-span-2 mb-6">
            <Controller
              control={control}
              name="profile_color"
              render={({ field }) => (
                <>
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${field.value} flex items-center justify-center shadow-md text-white text-3xl font-semibold uppercase`}
                  >
                    {firstName?.[0]}
                    {lastName?.[0]}
                  </div>
                  <span className="text-sm">Choose color</span>
                  <input type="hidden" id="profile-color" {...field} />
                  <div className="flex flex-wrap gap-2 w-[280px]">
                    {gradientList.map((gradient) => (
                      <button
                        type="button"
                        key={gradient}
                        onClick={() => field.onChange(gradient)}
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} ${
                          field.value === gradient
                            ? "border-gray-400 border-4"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                  {errors.profile_color && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.profile_color.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className=" text-white rounded-lg font-bold"
            >
              {isSubmitting ? "Updating profile..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
