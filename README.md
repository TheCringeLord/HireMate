This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Theme Toggle

This project includes a `ThemeProvider` wrapper (`src/components/theme-provider.tsx`) and a `ThemeToggle` component (`src/components/ui/theme-toggle.tsx`) that lets users switch between Light, Dark, and System themes.

### Usage

Add it to a header or navigation client component:

```tsx
"use client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-lg font-semibold">HireMate</h1>
      <ThemeToggle />
    </header>
  );
}
```

### How it works

- Uses `next-themes` to apply a `class` (light/dark) to `<html>`.
- Saves preference in `localStorage` so it persists across visits.
- Supports `system` to follow the OS preference and updates automatically on change.
- Tailwind's `dark:` variants respond automatically (Tailwind dark mode should be set to `class`).

### Customizing

Edit defaults in `theme-provider.tsx` (e.g. change `defaultTheme`). You can style the dropdown/button further by replacing the temporary `BaseButton` with your generated shadcn `Button` component once available.
