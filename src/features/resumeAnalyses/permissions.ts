import { hasPermission } from "@/app/services/clerk/lib/hasPermission";


export async function canRunResumeAnalysis() {
  return hasPermission("unlimited_resume_analysis")
}
