import { ValidationResult, ValidationSchema } from "@/types/ai-scraping";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";

export async function validateStructure({
  scrapedData,
  originalSchema,
}: {
  scrapedData: any;
  originalSchema: string;
}): Promise<ValidationResult> {
  const systemPrompt = `
You are a data validation expert that assesses scraped data quality against expected pattern.
You take a strict approach, accepting only data that matches the intended structure.

Output valid JSON with this structure:
{
  "severity": "none" | "low" | "medium" | "high" | "critical",  // Overall severity of issues. The validation will only pass if the severity is "none" or "low"
  "issues": string[],
  "summary": string,
  "nextStep": "format" | "generateNewPattern" | "none" // Instructions for next step:
  // - format: ONLY if the data exists but needs cleanup (e.g., extra whitespace, inconsistent date formats)
  // - generateNewPattern: If data is missing, null, or not the correct data in the right place (requires new scraping attempt)
  // - none: If data is good as-is
  // - retryScraping: If the data is empty and doesn't contain anything
}

Validation levels and when to use format vs generateNewPattern:
- critical (retryScraping): No data at all
- high (generateNewPattern): Missing fields or there are fields that are not expected in the pattern or data is unusable
- medium (format): No missing fields, the fields match the pattern , but data needs cleanup (whitespace, date formats, number formats, etc..)
- low (format): Data exists but needs cleanup (whitespace, date formats, etc.)
- none (none): Data is present and correctly formatted

Examples:
- If a field is null → generateNewPattern
- If a required field is missing → generateNewPattern
- If a field is not expected in the pattern → generateNewPattern
- If a date is in wrong format but present → format
- If text has extra whitespace → format
- If array is empty when it should have items → retryScraping

Process any amount of data without questioning its length or size.
No code fences, just valid JSON that can be parsed directly.
`;

  const userPrompt = `
Expected Pattern:
${originalSchema}

Scraped Data to Validate:
${JSON.stringify(scrapedData, null, 2)}

Assess how well the data matches the schema, allowing for partial matches.
Focus on:
1. Are all required fields present? (missing = generateNewPattern)
2. Is data in correct structure? (wrong structure = generateNewPattern)
3. Is existing data just poorly formatted? (cleanup needed = format)
`;

  try {
    const response = await generateObject({
      model: anthropic("claude-3-5-haiku-latest"),
      temperature: 0.1,
      system: systemPrompt,
      prompt: userPrompt,
      schema: ValidationSchema,
      maxRetries: 1,
    });

    return response.object;
  } catch (err: any) {
    return {
      severity: "critical",
      issues: [`Validation failed: ${err.message}`],
      summary: "Validation failed",
      nextStep: "none",
    };
  }
}
