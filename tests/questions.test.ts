import { describe, it, expect } from "vitest";
import {
  buildQuestionSystemPrompt,
  buildAnswerFeedbackSystemPrompt,
  truncateQuestionText,
  sanitizeBackticks,
} from "@/app/services/ai/questions";

const jobInfo = {
  title: "Full Stack Engineer",
  description:
    "Work with Next.js, TypeScript, Drizzle ORM, and performance optimization.",
  experienceLevel: "mid-level",
} as const;

describe("questions helpers", () => {
  it("buildQuestionSystemPrompt contains job info and directives", () => {
    const prompt = buildQuestionSystemPrompt(jobInfo);
    expect(prompt).toMatch(/Full Stack Engineer/);
    expect(prompt).toMatch(/Return ONLY the question/);
  });

  it("buildAnswerFeedbackSystemPrompt enforces format", () => {
    const prompt = buildAnswerFeedbackSystemPrompt("Explain event loop.");
    expect(prompt).toMatch(/## Feedback/);
    expect(prompt).toMatch(/Correct Answer/);
  });

  it("truncateQuestionText truncates long input", () => {
    const long = "a".repeat(2000);
    const truncated = truncateQuestionText(long, 50);
    expect(truncated.endsWith("…[truncated]")).toBe(true);
  });

  it("sanitizeBackticks escapes fences", () => {
    const value = "Example ``` code block";
    const sanitized = sanitizeBackticks(value);
    expect(sanitized).not.toContain("```");
  });
});
