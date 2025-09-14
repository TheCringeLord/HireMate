"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { SignOutButton, useClerk } from "@clerk/nextjs";
import { LogOut, User as UserIcon, Handshake } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type NavbarUser = { name: string; imageUrl: string };

export function Navbar({ user }: { user: NavbarUser }) {
  const { openUserProfile } = useClerk();

  return (
    <nav
      className={cn(
        "h-header border-b flex items-center px-4 gap-4", // layout
        "bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0 z-40"
      )}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/app"
          className="flex items-center gap-2 font-semibold text-lg leading-none select-none"
        >
          <Handshake className="size-5 text-primary" />
          <span className="truncate">HireMate</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <UserAvatar user={user} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-48">
            <DropdownMenuLabel className="text-xs uppercase tracking-wide opacity-60">
              Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openUserProfile?.()}
              className="cursor-pointer"
            >
              <UserIcon className="size-4" /> Profile
            </DropdownMenuItem>
            <SignOutButton>
              <DropdownMenuItem
                className="cursor-pointer"
                variant="destructive"
              >
                <LogOut className="size-4" /> Logout
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
