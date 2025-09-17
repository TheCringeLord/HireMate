# Interview Feedback Component

The `InterviewFeedback` component renders AI-generated interview coaching feedback with:

- Overall rating badge
- Category cards with rating badges and progress bars
- Normalized markdown body (using `normalizeInterviewFeedbackMarkdown`)
- Automatic parsing of optional JSON summary at start of model output

## Usage

```tsx
import { InterviewFeedback } from "@/components/InterviewFeedback";
import { generateAiInterviewFeedback } from "@/app/services/ai/interviews";

export default async function FeedbackPage({
  params,
}: {
  params: { id: string };
}) {
  const raw = await generateAiInterviewFeedback({
    humeChatId: params.id,
    jobInfo: {
      title: "Senior Backend Engineer",
      description: "Build APIs",
      experienceLevel: "senior",
    },
    userName: "Alice",
    options: { includeJsonSummary: true },
  });

  return <InterviewFeedback content={raw} />;
}
```

## Props

| Prop         | Type      | Default  | Description                        |
| ------------ | --------- | -------- | ---------------------------------- |
| `content`    | `string`  | required | Raw model output text              |
| `showBadges` | `boolean` | `true`   | Show numeric rating badges         |
| `showBars`   | `boolean` | `true`   | Show progress bars for each rating |
| `className`  | `string`  | —        | Extra container classes            |

## Notes

- If the model output starts with a JSON summary (when `includeJsonSummary` is set), it will be parsed for structured ratings.
- Headings in the markdown are normalized if the model deviates slightly from the requested format.
- Strengths / Areas for Improvement section gets additional formatting.

## Extending

- Add tooltips around ratings to explain scoring criteria.
- Replace color logic in `ratingColor` with theme tokens.
- Add export to CSV / PDF using parsed summary data.
