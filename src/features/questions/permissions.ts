import { getCurrentUser } from "@/app/services/clerk/lib/getCurrentUser";
import { hasPermission } from "@/app/services/clerk/lib/hasPermission";
import { db } from "@/drizzle/db";
import { JobInfoTable, QuestionTable } from "@/drizzle/schema";

import { count, eq } from "drizzle-orm";

// Basic toggle so we can silence logs in production unless explicitly enabled.
// const DEBUG_PERMISSIONS =
//   process.env.NODE_ENV !== "production" &&
//   process.env.FEATURE_DEBUG_PERMISSIONS !== "false";

export type QuestionPermissionDebug = {
  unlimitedFeature: boolean;
  fiveFeature: boolean;
  questionCount: number;
  allowed: boolean;
  limit?: number | "unlimited";
};

export async function canCreateQuestion(): Promise<boolean> {
  const [unlimited, five, count] = await Promise.all([
    hasPermission("unlimited_questions"),
    hasPermission("5_questions"),
    getUserQuestionCount(),
  ]);

  if (unlimited) {
    return true;
  } else if (five && count < 5) {
    return true;
  } else {
    return false;
  }
}

async function getUserQuestionCount() {
  const { userId } = await getCurrentUser();
  if (userId == null) return 0;

  return getQuestionCount(userId);
}

async function getQuestionCount(userId: string) {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(QuestionTable)
    .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
    .where(eq(JobInfoTable.userId, userId));

  return c;
}
