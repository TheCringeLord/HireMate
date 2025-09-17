"use client";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  parseInterviewFeedbackSummary,
  normalizeInterviewFeedbackMarkdown,
} from "@/app/services/ai/interviews";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface InterviewFeedbackProps {
  /** Raw model output */
  content: string;
  /** Show numeric rating badges */
  showBadges?: boolean;
  /** Show progress bars next to categories */
  showBars?: boolean;
  /** Optional className */
  className?: string;
}

interface ParsedCategory {
  name: string;
  rating?: number;
  summary?: string;
}

const CATEGORY_ORDER = [
  "Communication Clarity",
  "Confidence and Emotional State",
  "Response Quality",
  "Pacing and Timing",
  "Engagement and Interaction",
  "Role Fit & Alignment",
  "Overall Strengths & Areas for Improvement",
];

export function InterviewFeedback({
  content,
  showBadges = true,
  showBars = true,
  className,
}: InterviewFeedbackProps) {
  const { summary, markdown, categories } = useMemo(() => {
    const normalized = normalizeInterviewFeedbackMarkdown(content);
    const { summary, markdown } = parseInterviewFeedbackSummary(normalized);
    // Extract headings with ratings from markdown if summary absent
    const extracted: ParsedCategory[] = [];
    const headingRegex = /^##\s+(.+?)(?::\s*(\d{1,2})\/10)?\s*$/gm;
    const md = markdown || normalized;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(md))) {
      const name = match[1].trim();
      const ratingNum = match[2] ? Number(match[2]) : undefined;
      extracted.push({ name, rating: ratingNum });
    }
    // If we have a structured summary, map categories; else use extracted headings
    let categories: ParsedCategory[] = [];
    if (summary) {
      categories = summary.categories.map((c) => ({
        name: c.name,
        rating: c.rating,
        summary: c.summary,
      }));
    } else if (extracted.length) {
      categories = extracted;
    }
    // Sort according to canonical order
    categories.sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.name) - CATEGORY_ORDER.indexOf(b.name)
    );
    return { summary, markdown: md, categories };
  }, [content]);

  return (
    <div className={cn("space-y-6", className)}>
      {summary?.overallRating != null && (
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold tracking-tight">Feedback</h2>
          <Badge variant="secondary" className="text-sm py-1 px-2">
            Overall: {summary.overallRating}/10
          </Badge>
        </div>
      )}
      {categories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((c) => (
            <Card
              key={c.name}
              className="p-4 flex flex-col gap-2 border border-border/60 bg-card/40 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm leading-tight flex-1">
                  {c.name}
                </h3>
                {showBadges && c.rating != null && (
                  <Badge className={cn("text-xs", ratingColor(c.rating).badge)}>
                    {c.rating}/10
                  </Badge>
                )}
              </div>
              {showBars && c.rating != null && (
                <div className="h-2 rounded bg-muted/40 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      ratingColor(c.rating).bar
                    )}
                    style={{ width: `${(c.rating / 10) * 100}%` }}
                  />
                </div>
              )}
              {c.summary && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {c.summary}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
      <MarkdownRenderer className="prose-sm">{markdown}</MarkdownRenderer>
    </div>
  );
}

function ratingColor(rating: number): { badge: string; bar: string } {
  if (rating >= 8)
    return { badge: "bg-emerald-600 text-white", bar: "bg-emerald-500" };
  if (rating >= 5)
    return { badge: "bg-amber-600 text-white", bar: "bg-amber-500" };
  return { badge: "bg-rose-600 text-white", bar: "bg-rose-500" };
}
