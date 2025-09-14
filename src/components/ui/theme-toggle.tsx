"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const mounted = React.useRef(false);
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    mounted.current = true;
    setIsMounted(true);
  }, []);

  const active = theme === "system" ? systemTheme : theme;

  if (!isMounted) {
    // Avoid hydration mismatch (next-themes needs client)
    return (
      <Button
        aria-label="Toggle theme"
        variant="ghost"
        size="icon"
        className="relative"
        disabled
      >
        <Sun className="size-5 opacity-40" />
      </Button>
    );
  }

  const items: Array<{ key: string; label: string; icon: React.ReactNode }> = [
    { key: "light", label: "Light", icon: <Sun /> },
    { key: "dark", label: "Dark", icon: <Moon /> },
    { key: "system", label: "System", icon: <Laptop /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Toggle theme"
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuLabel className="text-xs uppercase tracking-wide opacity-60">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <DropdownMenuItem
              key={it.key}
              onClick={() => setTheme(it.key)}
              className={
                "cursor-pointer flex items-center gap-2" +
                (isActive
                  ? " font-semibold bg-accent text-accent-foreground"
                  : "")
              }
              data-active={isActive || undefined}
            >
              <span className="flex items-center gap-2">
                {it.icon}
                {it.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
