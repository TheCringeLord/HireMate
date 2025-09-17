import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache";
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { formatDateTime } from "@/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-6 gap-6 min-h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <Suspense fallback={<InterviewsSkeleton />}>
        {" "}
        {/* modern skeleton */}
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

function InterviewsSkeleton() {
  return (
    <div className="space-y-8 w-full animate-in fade-in-50">
      <HeaderSkeleton />
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="animate-pulse">
            <div className="h-40 rounded-xl bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="space-y-3 w-full max-w-lg">
        <div className="h-10 w-2/3 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
      </div>
      <div className="h-10 w-40 rounded-md bg-muted animate-pulse" />
    </div>
  );
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const interviews = await getInterviews(jobInfoId, userId);
  if (interviews.length === 0) {
    return redirect(`/app/job-infos/${jobInfoId}/interviews/new`);
  }
  return (
    <div className="space-y-8 w-full">
      <Header jobInfoId={jobInfoId} count={interviews.length} />
      <InterviewGrid jobInfoId={jobInfoId} interviews={interviews} />
    </div>
  );
}

function Header({ jobInfoId, count }: { jobInfoId: string; count: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
        <p className="text-muted-foreground max-w-xl text-base">
          Review past practice interviews. Click any card to view feedback and
          transcript.
        </p>
      </div>
      <Button asChild>
        <Link
          href={`/app/job-infos/${jobInfoId}/interviews/new`}
          aria-label="Create new interview"
        >
          <PlusIcon className="size-4" />
          New Interview
        </Link>
      </Button>
    </div>
  );
}

function InterviewGrid({
  jobInfoId,
  interviews,
}: {
  jobInfoId: string;
  interviews: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    duration: string;
  }>;
}) {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
      {/* New interview tile */}
      <li>
        <Card className="h-full border-dashed shadow-none">
          <Link
            href={`/app/job-infos/${jobInfoId}/interviews/new`}
            className="h-full flex items-center justify-center p-6 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            aria-label="Create new interview"
          >
            <PlusIcon className="size-5" aria-hidden="true" />
            <span className="ml-2">New Interview</span>
          </Link>
        </Card>
      </li>
      {interviews.map((interview) => (
        <li key={interview.id}>
          <Card className="h-full transition hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-primary motion-reduce:hover:shadow-none motion-reduce:hover:translate-y-0">
            <Link
              href={`/app/job-infos/${jobInfoId}/interviews/${interview.id}`}
              className="flex items-stretch justify-between gap-2 p-4"
              aria-label={`Open interview from ${formatDateTime(
                interview.createdAt
              )}`}
            >
              <div className="flex-1 min-w-0">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-xl truncate">
                    {formatDateTime(interview.createdAt)}
                  </CardTitle>
                  <CardDescription className="truncate flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {interview.duration}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(interview.updatedAt)}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 text-muted-foreground">
                  <p className="text-sm line-clamp-2">
                    Practice interview session. View details & feedback.
                  </p>
                </CardContent>
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
    </ul>
  );
}

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day} day${day > 1 ? "s" : ""} ago`;
  if (hr > 0) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (min > 0) return `${min} minute${min > 1 ? "s" : ""} ago`;
  return "just now";
}

async function getInterviews(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getInterviewJobInfoTag(jobInfoId));
  cacheTag(getJobInfoIdTag(jobInfoId));

  const data = await db.query.InterviewTable.findMany({
    where: and(
      eq(InterviewTable.jobInfoId, jobInfoId),
      isNotNull(InterviewTable.humeChatId)
    ),
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  });

  return data.filter((interview) => interview.jobInfo.userId === userId);
}
