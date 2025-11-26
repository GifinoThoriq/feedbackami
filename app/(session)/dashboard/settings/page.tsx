"use server";

import { getProfile } from "@/app/actions/profileActions";
import ProfileForm from "@/components/dashboard/settings/ProfileForm";

export default async function Settings() {
  const profile = await getProfile();

  return (
    <div className="grid grid-cols-12 min-h-dvh">
      <aside className="col-span-2 flex-col text-sidebar-foreground md:flex">
        <nav className="flex-1 overflow-y-auto px-3 py-4 border-r">
          <div className="space-y-1">
            <button className="py-2 px-3  rounded-lg font-normal text-sm flex items-center gap-2 mb-2 w-full">
              My Account
            </button>
          </div>
        </nav>
      </aside>
      <div className="col-span-10 p-4">
        <h6 className="font-semibold">My Account</h6>
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
