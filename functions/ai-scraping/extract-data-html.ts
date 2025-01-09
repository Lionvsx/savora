import { AIScraper } from "@/services/ai-scraper";
import { DatabaseInstruction } from "@/types/ai-scraping";
import { logger, retry } from "@trigger.dev/sdk/v3";
import { executeValidationStep } from "../../trigger/ai-scraping/execute-validation-step";
import { cacheHTML, updateInstructions } from "./instructions/database";

const DEFAULT_MAX_ATTEMPTS = 5;

interface ExtractDataFromHtmlPayload {
  html: string;
  url: string;
  scraper: AIScraper;
  lastSavedInstructions: DatabaseInstruction | null;
  maxAIScraperAttempts?: number;
}

export async function extractDataFromHtml(payload: ExtractDataFromHtmlPayload) {
  logger.info(`Extracting data from HTML`);

  const {
    html,
    url,
    lastSavedInstructions,
    scraper,
    maxAIScraperAttempts = DEFAULT_MAX_ATTEMPTS,
  } = payload;
  let success = false;
  scraper.scrapeWithPattern(html);

  await retry.onThrow(
    async ({ attempt, maxAttempts }) => {
      const validation = await scraper.evaluateScrapingResult();

      logger.info(`Validation result severity: ${validation.severity}`, {
        validation,
        result: scraper.result,
      });

      await executeValidationStep({
        html,
        validation,
        scraper,
        attempt,
      });

      if (validation.severity === "none" || validation.severity === "low") {
        if (lastSavedInstructions) {
          logger.info("Updating instructions");
          await updateInstructions({
            instructionsId: lastSavedInstructions.id,
            instructions: scraper.scrapingInstructions,
            url,
            pattern: lastSavedInstructions.pattern,
          });

          logger.info("Caching HTML");
          await cacheHTML(lastSavedInstructions.url, html);
        }
        success = true;
      } else {
        throw new Error(
          `Attempt ${attempt}/${maxAttempts} failed to extract data from HTML`
        );
      }
    },
    {
      maxAttempts: maxAIScraperAttempts,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 60_000,
      factor: 2,
    }
  );

  if (!success) {
    throw new Error(
      `Failed to extract data from HTML after ${maxAIScraperAttempts} attempts`
    );
  }
}
