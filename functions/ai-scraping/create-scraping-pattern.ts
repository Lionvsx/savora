import {
  ScrapingInstructions,
  ScrapingInstructionsSchema,
  ScrapingResult,
  ValidationResult,
} from "@/types/ai-scraping";
import { anthropic } from "@ai-sdk/anthropic";
import { logger } from "@trigger.dev/sdk/v3";
import { generateObject } from "ai";

/**
 * 1) We prompt the AI model to generate a JSON describing how to find fields, with CSS selectors.
 * 2) We parse that JSON and return it as `ScrapingPattern`.
 */
export async function createScrapingPattern({
  html,
  pattern,
  feedback,
  lastResult,
  failedAttempts,
}: {
  html: string;
  pattern: string;
  feedback?: ValidationResult;
  lastResult?: ScrapingResult;
  failedAttempts?: Array<{
    instructions: ScrapingInstructions;
    result: ScrapingResult | null;
    feedback: ValidationResult;
    timestamp: string;
  }>;
}): Promise<ScrapingInstructions> {
  logger.debug("Creating scraping pattern", {
    html,
    pattern,
    feedback,
    lastResult,
    failedAttempts,
  });

  const systemPrompt = `You are an expert web scraping specialist. Your task is to generate precise CSS selectors to extract data from HTML content.

CONTEXT:
- This is part of a web scraping system that uses Cheerio to extract data
- The scraping system supports nested data structures and lists
- Each field can extract text content or specific attributes (href, src, etc)
- Numbers should be cleaned of currency symbols and formatted as plain numbers

OUTPUT REQUIREMENTS:
Generate a JSON object with:
{
  "name": "string", // Brief pattern name
  "description": "string", // What this pattern extracts
  "instructions": [
    {
      "fieldName": "string", // The field to extract
      "selector": "string", // CSS selector
      "attribute": "text|href|src|etc", // Optional attribute to extract
      "type": "string|number|date",
      "isList": boolean, // True if field returns multiple items
      "childInstructions": [] // Optional nested fields
    }
  ]
}

SELECTOR GUIDELINES:
1. Use ID selectors (#id) when available
2. Prefer data attributes [data-*] when meaningful
3. Use specific class combinations for uniqueness
4. Avoid complex nth-child selectors unless necessary`;

  const userPrompt = `HTML CONTENT:
${html}

TARGET PATTERN:
${pattern}
${
  feedback && lastResult
    ? `
PREVIOUS ATTEMPT FEEDBACK:
• Result: ${JSON.stringify(lastResult.data, null, 2)}
• Severity: ${feedback.severity}
• Issues: ${feedback.issues.join(", ")}
• Analysis: ${feedback.summary}`
    : ""
}
${
  failedAttempts?.length
    ? `
FAILED ATTEMPTS:
${failedAttempts
  .map(
    (a) => `• Time: ${a.timestamp}
• Issues: ${a.feedback.issues.join(", ")}`
  )
  .join("\n")}`
    : ""
}`;

  try {
    // We'll parse the AI model's response into the nested structure using zod
    const response = await generateObject({
      model: anthropic("claude-3-5-sonnet-latest"),
      temperature: 0.8,
      system: systemPrompt,
      prompt: userPrompt,
      schema: ScrapingInstructionsSchema,
      maxRetries: 2,
    });

    // Return the validated object
    return response.object;
  } catch (err: any) {
    throw new Error(`createScrapingPattern error: ${err.message}`);
  }
}
