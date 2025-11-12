"use client";

import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface IProps {
  children: React.ReactNode;
}

export default function HeaderNav({ children }: IProps) {
  const headerNav = [
    {
      label: "Feedback",
      href: "/dashboard/feedback",
    },
    {
      label: "Roadmap",
      href: "/dashboard/roadmap",
    },
    {
      label: "Users",
      href: "dashboard/users",
    },
  ];

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex h-16 items-center gap-3 border-b pr-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-sidebar-primary-foreground">
              FK
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-md border md:hidden">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="flex flex-1 gap-4">
              {headerNav.map((nav) => (
                <Link key={nav.label} href={nav.href}>
                  <div
                    className={`${
                      nav.href === pathname &&
                      "bg-muted text-sidebar-accent-foreground"
                    } hover:bg-muted px-4 py-2 text-muted-foreground rounded-md hover:text-sidebar-accent-foreground`}
                  >
                    <p className="text-sm  font-medium">{nav.label}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full border">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-sidebar-primary-foreground">
                FA
              </div>
            </div>
          </div>
        </header>
      </div>
      {children}
    </div>
  );
}
