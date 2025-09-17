import { describe, it, expect } from "vitest";
import {
  buildPrompt,
  sanitizeEmotionFeatures,
  truncate,
  parseInterviewFeedbackSummary,
  normalizeInterviewFeedbackMarkdown,
} from "@/app/services/ai/interviews";

const sampleJobInfo = {
  title: "Senior Backend Engineer",
  description:
    "We build scalable APIs and distributed systems. Focus on performance and reliability. Cloud native, Postgres, and messaging queues.",
  experienceLevel: "senior",
} as const;

describe("interviews helpers", () => {
  it("truncate short text returns same", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncate long text adds ellipsis", () => {
    const long = "x".repeat(15);
    expect(truncate(long, 5)).toBe("xxxxx …[truncated]");
  });

  it("sanitizeEmotionFeatures filters invalid and bounds", () => {
    const result = sanitizeEmotionFeatures({
      joy: 0.9234,
      sad: 1.2,
      weird: "x",
    });
    expect(result).toHaveProperty("joy");
    expect(result?.sad).toBeUndefined();
  });

  it("buildPrompt contains job title and categories", () => {
    const prompt = buildPrompt({
      transcript: [],
      jobInfo: sampleJobInfo,
      userName: "Alice",
      includeJsonSummary: false,
    });
    expect(prompt).toMatch(/Interviewee: Alice/);
    expect(prompt).toMatch(/Role Title: Senior Backend Engineer/);
    expect(prompt).toMatch(/Overall Strengths/);
  });

  it("parseInterviewFeedbackSummary returns summary when JSON present", () => {
    const output = `{"overallRating":8,"categories":[{"name":"Communication","rating":7,"summary":"Good"}]}\n\n# Markdown part`;
    const { summary, markdown } = parseInterviewFeedbackSummary(output);
    expect(summary?.overallRating).toBe(8);
    expect(markdown).toContain("# Markdown part");
  });

  it("parseInterviewFeedbackSummary returns only markdown when invalid JSON", () => {
    const output = `{ invalid json }\n\n# Rest`;
    const { summary, markdown } = parseInterviewFeedbackSummary(output);
    expect(summary).toBeUndefined();
    expect(markdown).toContain("{ invalid json }");
  });

  it("normalizeInterviewFeedbackMarkdown converts plain lines into headings", () => {
    const raw = `Overall Rating: 7/10\nCommunication Clarity: 6/10\nSome text here.\nConfidence and Emotional State: 5/10\nBody line.\nOverall Strengths & Areas for Improvement: 7/10\nStrengths:\nFast responses.\nAreas for Improvement:\nMore detail.`;
    const norm = normalizeInterviewFeedbackMarkdown(raw);
    expect(norm).toMatch(/## Communication Clarity: 6\/10/); // heading inserted
    expect(norm).toMatch(/## Confidence and Emotional State: 5\/10/);
    expect(norm).toMatch(/\*\*Strengths\*\*/); // bolded
    expect(norm).toMatch(/\*\*Areas for Improvement\*\*/);
  });

  it("normalizeInterviewFeedbackMarkdown detects headings with markdown formatting", () => {
    const raw = `Overall Rating: 9/10\n**Communication Clarity: 8/10**\nGreat.\n## Response Quality: 7/10\nSolid.\n`; // mixed formatting
    const norm = normalizeInterviewFeedbackMarkdown(raw);
    expect(norm).toMatch(/## Communication Clarity: 8\/10/);
    expect(norm).toMatch(/## Response Quality: 7\/10/);
  });

  it("normalizeInterviewFeedbackMarkdown falls back when no categories found", () => {
    const raw = `Overall Rating: 5/10\nSome narrative text without categories.`;
    const norm = normalizeInterviewFeedbackMarkdown(raw);
    // Should contain original narrative since no category headings created
    expect(norm).toContain("Some narrative text without categories.");
  });
});
