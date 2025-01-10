import {
  EXTRACT_DATA_PROMPT,
  EXTRACT_PAGINATION_SYSTEM_PROMPT,
} from "@/lib/utils/prompts/data-extraction";
import { openai } from "@ai-sdk/openai";
import { task } from "@trigger.dev/sdk/v3";
import { generateObject } from "ai";
import { z } from "zod";

interface ExtractPaginationHtmlPayload {
  html: string;
  pattern: string;
}

export const extractPaginationHtml = task({
  id: "extract-pagination-html",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 60_000,
  },
  run: async (payload: ExtractPaginationHtmlPayload) => {
    const { html, pattern } = payload;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: EXTRACT_PAGINATION_SYSTEM_PROMPT,
      prompt: EXTRACT_DATA_PROMPT(html, pattern),
      schema: z.object({
        hasError: z
          .boolean()
          .describe(
            "Whether there was an error during the extraction, example, we have bean blocked by the website"
          ),
        errorMessage: z
          .string()
          .optional()
          .describe("The error message if there was an error"),
        hasMoreData: z
          .boolean()
          .optional()
          .describe("Whether there is more data to extract"),
        nextCursorUrl: z
          .string()
          .optional()
          .describe("The URL to navigate to if there is more data to extract"),
      }),
      maxRetries: 2,
    });

    return result.object;
  },
});
