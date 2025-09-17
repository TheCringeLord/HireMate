import type { ModelMessage } from "ai"; // prefer ModelMessage in v5

export async function fileToUserMessage(file: File): Promise<ModelMessage> {
  const buffer = await file.arrayBuffer();
  return {
    role: "user",
    content: [
      {
        type: "file",
        data: new Uint8Array(buffer), // or a URL string
        mediaType: file.type || "application/octet-stream",
        filename: file.name,
      },
    ],
  };
}

/** Development-time validator to catch malformed messages earlier. */
export function devAssertModelMessages(messages: ModelMessage[]) {
  if (process.env.NODE_ENV === "production") return;

  for (const [i, m] of messages.entries()) {
    if (!["system", "user", "assistant", "tool"].includes(m.role as string)) {
      throw new Error(`Invalid role at index ${i}: ${m.role}`);
    }
    if (!Array.isArray(m.content)) continue;

    for (const [j, part] of m.content.entries()) {
      if (part.type === "file") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d: any = (part as any).data;
        const isBin =
          d instanceof Uint8Array ||
          d instanceof ArrayBuffer ||
          Buffer.isBuffer?.(d);
        const isUrl = typeof d === "string" || d instanceof URL;
        if (!isBin && !isUrl) {
          throw new Error(
            `File part ${i}:${j} has invalid data type: ${Object.prototype.toString.call(
              d
            )}`
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(part as any).mediaType) {
          throw new Error(`File part ${i}:${j} missing mediaType`);
        }
      } else if (part.type === "text") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (part as any).text !== "string") {
          throw new Error(`Text part ${i}:${j} missing text string`);
        }
      }
    }
  }
}
