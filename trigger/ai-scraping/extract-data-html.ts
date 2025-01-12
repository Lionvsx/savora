import { extractDataFromHtml } from "@/functions/ai-scraping/extract-data-html";
import { AIScraper } from "@/services/ai-scraper";
import { DatabaseInstruction } from "@/types/ai-scraping";
import { metadata, task } from "@trigger.dev/sdk/v3";
import { chooseInstructions } from "./choose-instructions";

interface ExtractDataHtmlPayload {
  html: string;
  url: string;
  pattern: string;
  maxAIScraperAttempts?: number;
}

export const extractionJob = task({
  id: "extract-data-html",
  retry: {
    maxAttempts: 0,
  },
  queue: {
    concurrencyLimit: 10,
  },
  run: async (payload: ExtractDataHtmlPayload) => {
    const { html, url, pattern, maxAIScraperAttempts } = payload;
    metadata.root.append("logs", {
      type: "info",
      message: `Looking for instructions for pattern selected pattern`,
    });
    const chooseInstructionsResult = await chooseInstructions.triggerAndWait({
      pattern,
      url,
      html,
    });

    if (!chooseInstructionsResult.ok) {
      metadata.root.append("logs", {
        type: "error",
        message: `Failed to choose instructions`,
      });
      throw new Error(String(chooseInstructionsResult.error));
    }

    let lastSavedInstructions: DatabaseInstruction | null =
      chooseInstructionsResult.output;

    const scraper = new AIScraper(chooseInstructionsResult.output, pattern);

    await extractDataFromHtml({
      html,
      url,
      scraper,
      lastSavedInstructions,
      maxAIScraperAttempts,
    });

    return scraper.result;
  },
});
