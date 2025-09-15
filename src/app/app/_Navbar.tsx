"use client";

// UI Components
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Auth / User
import { SignOutButton, useClerk } from "@clerk/nextjs";

// Icons
import {
  LogOut,
  User as UserIcon,
  Handshake,
  BookOpen,
  FileSliders,
  Speech,
} from "lucide-react";
import type { ComponentType } from "react";

// Next.js
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

// Utils & local components
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type NavbarUser = { name: string; imageUrl: string };

// Navigational links that depend on a jobInfoId context
const navLinks: { name: string; href: string; Icon: ComponentType<any> }[] = [
  { name: "Interviews", href: "interviews", Icon: Speech },
  { name: "Questions", href: "questions", Icon: BookOpen },
  { name: "Resume", href: "resume", Icon: FileSliders },
];

export function Navbar({ user }: { user: NavbarUser }) {
  const { openUserProfile } = useClerk();
  const params = useParams();
  const pathName = usePathname();
  const jobInfoId =
    typeof params?.jobInfoId === "string" ? params.jobInfoId : undefined;
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
        {jobInfoId &&
          navLinks.map(({ name, href, Icon }) => {
            const hrefPath = `/app/job-infos/${jobInfoId}/${href}`;
            const isActive = pathName === hrefPath;
            return (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                key={name}
                asChild
                className="cursor-pointer gap-2 max-sm:hidden"
              >
                <Link
                  href={hrefPath}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-4" />
                  <span>{name}</span>
                </Link>
              </Button>
            );
          })}
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
