import { z } from "zod";

//--------------------------------------------------------------------------------------
// Types
//--------------------------------------------------------------------------------------

export const ScrapingInstructionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    fieldName: z.string(),
    selector: z.string(),
    attribute: z.string().optional(),
    type: z.enum(["string", "number", "date"]).optional(),
    isList: z.boolean().optional(),
    childInstructions: z.array(ScrapingInstructionSchema).optional(), // recursion
  })
);

export const ScrapingInstructionsSchema = z.object({
  name: z.string().describe("The name of the pattern"),
  description: z
    .string()
    .describe(
      "What the pattern is used for, e.g. 'scrape reviews from a restaurant'. This is used to help the AI understand the pattern and when to use it."
    ),
  instructions: z.array(ScrapingInstructionSchema),
});

export const ValidationSchema = z.object({
  severity: z.enum(["none", "low", "medium", "high", "critical"]),
  issues: z
    .array(
      z
        .string()
        .describe(
          "When nextStep is 'format', add formatting instructions after each issue like this: issue -> instructions"
        )
    )
    .describe("The issues found in the data."),
  summary: z.string(),
  nextStep: z.enum(["format", "generateNewPattern", "none", "retryScraping"]),
});

// We can define TypeScript types from these schemas
export type ScrapingInstruction = z.infer<typeof ScrapingInstructionSchema>;
export type ScrapingInstructions = z.infer<typeof ScrapingInstructionsSchema>;

export type DatabaseInstruction = {
  id: string;
  name: string;
  instructions: ScrapingInstruction[];
  description: string;
  url: string;
  pattern: string;
};

export interface ScrapingResult<T = any> {
  data?: T;
  error?: string;
}

export type ValidationResult = z.infer<typeof ValidationSchema>;
