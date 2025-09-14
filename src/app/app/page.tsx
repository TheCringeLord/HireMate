import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "../services/clerk/lib/getCurrentUser";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoUserTag } from "@/features/jobInfos/dbCache";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm";
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters";

// --- Page shell ---
export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="container my-8">
          <Header />
          <SkeletonGrid />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

function Header() {
  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">
          Select a job description
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          Choose a job to practice interviews tailored to its specifics.
        </p>
      </div>
      <Button asChild>
        <Link href="/app/job-infos/new" aria-label="Create job description">
          <PlusIcon className="size-4" />
          Create job description
        </Link>
      </Button>
    </div>
  );
}

async function JobInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfos = await getJobInfos(userId);

  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return (
    <div className="container my-8">
      <Header />

      {/* Optional: search/sort bar could live here */}

      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {jobInfos.map((job) => (
          <li key={job.id}>
            <Card
              className="
                h-full transition 
                hover:shadow-md hover:-translate-y-0.5
                focus-within:ring-2 focus-within:ring-primary
                motion-reduce:hover:shadow-none motion-reduce:hover:translate-y-0
              "
            >
              <Link
                href={`/app/job-infos/${job.id}`}
                className="flex items-stretch justify-between gap-2 p-4"
                aria-label={`Open ${job.name}`}
              >
                <div className="flex-1 min-w-0">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-xl truncate">
                      {job.name}
                    </CardTitle>
                    {job.title && (
                      <p className="text-sm text-primary truncate font-semibold">
                        {job.title}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="p-0 text-muted-foreground">
                    <p className="line-clamp-3">{job.description}</p>
                  </CardContent>

                  <CardFooter className="p-0 pt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {formatExperienceLevel(job.experienceLevel)}
                    </Badge>
                    {/* Updated time if available */}
                    <span className="text-xs text-muted-foreground ">
                      {(() => {
                        const diff =
                          Date.now() - new Date(job.updatedAt).getTime();
                        const sec = Math.floor(diff / 1000);
                        const min = Math.floor(sec / 60);
                        const hr = Math.floor(min / 60);
                        const day = Math.floor(hr / 24);
                        if (day > 0)
                          return `Last updated ${day} day${
                            day > 1 ? "s" : ""
                          } ago`;
                        if (hr > 0)
                          return `Last updated ${hr} hour${
                            hr > 1 ? "s" : ""
                          } ago`;
                        if (min > 0)
                          return `Last updated ${min} minute${
                            min > 1 ? "s" : ""
                          } ago`;
                        return "Last updated just now";
                      })()}
                    </span>
                  </CardFooter>
                </div>

                <div className="self-center pl-2">
                  <ArrowRightIcon
                    className="size-5 opacity-60"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </Card>
          </li>
        ))}

        {/* New tile */}
        <li>
          <Card className="h-full border-dashed shadow-none ">
            <Link
              href="/app/job-infos/new"
              className="h-full flex items-center justify-center p-6 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              aria-label="Create job description"
            >
              <PlusIcon className="size-5" aria-hidden="true" />
              <span className="ml-2">Create job description</span>
            </Link>
          </Card>
        </li>
      </ul>
    </div>
  );
}

function NoJobInfos() {
  return (
    <div className="container my-8 max-w-5xl">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-3">
        Welcome to HireMate
      </h1>
      <p className="text-muted-foreground mb-6">
        Start by describing the job you’re targeting. Specifics (stack, role,
        seniority) help us generate interviews that feel real.
      </p>
      <Card>
        <CardContent className="pt-6">
          <JobInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="animate-pulse">
          <div className="h-40 rounded-xl bg-muted" />
        </li>
      ))}
    </ul>
  );
}

async function getJobInfos(userId: string) {
  "use cache";
  cacheTag(getJobInfoUserTag(userId));
  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  });
}
