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

  const systemPrompt = `
<role>
You are an expert web scraping specialist and CSS selector engineer, with deep knowledge of HTML DOM structures and data extraction patterns. Your expertise lies in creating precise, robust, and maintainable scraping instructions.
</role>

<task>
Your task is to analyze HTML content and generate precise CSS selectors to extract specific data points. You will:
1. Analyze the HTML structure carefully
2. Identify the most reliable selectors for each target field
3. Generate a comprehensive scraping pattern
4. Validate the selectors will work consistently
</task>

<rules>
CRITICAL RULES:
1. Always use the most specific and robust CSS selectors possible
2. Prefer ID selectors (#id) over classes when available
3. Use attribute selectors [data-*] when meaningful
4. For lists, ensure the selector captures all instances
5. Numbers should be cleaned of currency symbols and formatted as plain numbers
6. Avoid using complex nth-child selectors unless absolutely necessary
</rules>

<output_format>
Output must be valid JSON with this structure:
{
  "name": "Brief, descriptive name of the scraping pattern",
  "description": "Detailed explanation of what this pattern extracts",
  "instructions": [
    {
      "fieldName": "humanReadableName",
      "selector": "precise.css > selector",
      "attribute": "text|href|src|data-*|etc",
      "type": "string|number|date",
      "isList": boolean,
      "childInstructions": [] // Optional, for nested data like reviews
    }
  ]
}
</output_format>

<thinking_process>
1. First, I will analyze the HTML structure to identify key elements
2. Then, I will determine the most reliable selectors for each field
3. Next, I will verify the selectors are unique and robust
4. Finally, I will format the instructions in the required JSON structure
</thinking_process>`;

  const userPrompt = `
<context>
I need you to analyze HTML content and create a precise scraping pattern that matches the specified target pattern.
</context>

<input_html>
${html}
</input_html>

<target_pattern>
${pattern}
</target_pattern>

${
  feedback && lastResult
    ? `
<previous_attempt>
<result>
${JSON.stringify(lastResult.data, null, 2)}
</result>

<feedback>
Severity: ${feedback.severity}
Issues:
${feedback.issues.map((issue) => `• ${issue}`).join("\n")}
Analysis: ${feedback.summary}
</feedback>
</previous_attempt>`
    : ""
}

${
  failedAttempts && failedAttempts.length > 0
    ? `
<historical_attempts>
${failedAttempts
  .map(
    (attempt, index) => `
<attempt number="${failedAttempts.length - index}">
• Time: ${attempt.timestamp}
• Issues: ${attempt.feedback.issues.join(", ")}
• Previous Instructions: ${JSON.stringify(attempt.instructions, null, 2)}
</attempt>`
  )
  .join("\n")}
</historical_attempts>`
    : ""
}

<instructions>
1. Analyze the provided HTML structure carefully
2. Consider any previous attempt feedback and issues
3. Generate precise CSS selectors that will reliably extract the required data
4. Ensure the output matches the target pattern exactly
5. Return ONLY valid JSON following the specified output format
</instructions>`;
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
