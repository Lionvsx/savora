import { AIScraper } from "@/services/ai-scraper";
import { ValidationResult } from "@/types/ai-scraping";
import { AbortTaskRunError, logger } from "@trigger.dev/sdk/v3";

export async function executeValidationStep({
  html,
  validation,
  scraper,
  attempt,
}: {
  html: string;
  validation: ValidationResult;
  scraper: AIScraper;
  attempt: number;
}) {
  if (validation.nextStep === "format") {
    logger.info(`Formatting scraping result`);
    await scraper.formatScrapingResult(validation);
    logger.info(`Formatting complete`, { result: scraper.result });
  } else if (validation.nextStep === "generateNewPattern") {
    logger.info(`Generating new pattern`);
    await scraper.generateNewPattern(html, validation);
    logger.info(`New pattern generated, scraping again`);
    scraper.scrapeWithPattern(html);
    logger.info(`Scraping complete`, { result: scraper.result });
  } else if (validation.nextStep === "retryScraping" && attempt > 0) {
    throw new AbortTaskRunError("Retry scraping");
  } else if (validation.severity === "critical") {
    logger.info(`Generating new pattern for the first critical error`);
    await scraper.generateNewPattern(html, validation);
    logger.info(`New pattern generated, scraping again`);
    scraper.scrapeWithPattern(html);
    logger.info(`Scraping complete`, { result: scraper.result });
  }
}
