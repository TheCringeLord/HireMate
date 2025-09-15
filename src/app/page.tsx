import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { PricingTable } from "./services/clerk/components/PricingTable";

export default function HomePage() {
  return (
    <>
      <SignInButton />
      <UserButton />
      <ThemeToggle />
      <PricingTable />
    </>
  );
}
