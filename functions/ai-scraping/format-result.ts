import { ValidationResult } from "@/types/ai-scraping";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function formatDataWithAI(data: any, feedback: ValidationResult) {
  const systemPrompt = `
You are a data formatting expert that standardizes and cleans EXISTING scraped data values.
You cannot fix missing or null values - those require changes to the scraping pattern itself.

Your role is LIMITED to:
1. Standardizing date formats to ISO for existing dates
2. Cleaning up existing text (removing extra whitespace, fixing capitalization)
3. Standardizing number formats for existing numbers
4. Maintaining the exact same structure as input

Important limitations:
- DO NOT attempt to fill in missing (null) values
- DO NOT attempt to find additional data
- DO NOT modify the data structure
- Only clean/format values that are already present

Output the exact same JSON structure with cleaned values.
No code fences, just valid JSON that can be parsed directly.`;

  const userPrompt = `
--- DATA START ---
${JSON.stringify(data, null, 2)}
--- DATA END ---

--- FEEDBACK START ---
Summary: ${feedback.summary}
Current issues: 
${feedback.issues.map((issue) => `- ${issue}`).join("\n")}
--- FEEDBACK END ---

Please format and clean this data while maintaining its exact structure.`;

  try {
    const response = await generateObject({
      model: openai("gpt-4o-mini"),
      temperature: 0.1,
      system: systemPrompt,
      prompt: userPrompt,
      schema: z.object({
        data: z
          .any()
          .describe("The formatted data using the same structure as the input"),
      }),
      maxRetries: 1,
    });

    return response.object.data;
  } catch (err: any) {
    throw new Error(`Formatting failed: ${err.message}`);
  }
}
