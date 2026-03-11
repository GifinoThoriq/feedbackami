"use client";

import Link from "next/link";
import AvatarColor from "@/components/ui/avatar-color";
import { logoutAction } from "@/app/actions/logoutActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IProps {
  profile: {
    first_name: string;
    last_name: string;
    profile_color: string;
  };
}

export default function PublicNavbar({ profile }: IProps) {
  async function handleLogout() {
    await logoutAction();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6 mb-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-sidebar-primary-foreground shrink-0">
        FK
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/feedback"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to my dashboard
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <AvatarColor
              profile_color={profile.profile_color}
              first_name={profile.first_name?.[0] ?? ""}
              last_name={profile.last_name?.[0] ?? ""}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-36" align="end">
            <DropdownMenuLabel>
              <div
                onClick={handleLogout}
                className="cursor-pointer text-destructive"
              >
                Logout
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
