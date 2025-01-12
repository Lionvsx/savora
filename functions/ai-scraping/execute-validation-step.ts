import { AIScraper } from "@/services/ai-scraper";
import { ValidationResult } from "@/types/ai-scraping";
import { AbortTaskRunError, logger, metadata } from "@trigger.dev/sdk/v3";

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
    metadata.root.append("logs", {
      type: "info",
      message: "Formatting scraping result using gpt-4o-mini",
    });
    await scraper.formatScrapingResult(validation);
    logger.info(`Formatting complete`, { result: scraper.result });
    metadata.root.append("logs", {
      type: "info",
      message: "Formatting complete",
      data: scraper.serializeResults(),
    });
  } else if (validation.nextStep === "generateNewPattern") {
    logger.info(`Generating new pattern`);
    metadata.root.append("logs", {
      type: "info",
      message: "Generating new pattern",
    });
    await scraper.generateNewPattern(html, validation);
    logger.info(`New pattern generated, scraping again`);
    metadata.root.append("logs", {
      type: "info",
      message: "Scraping again with new pattern",
    });
    scraper.scrapeWithPattern(html);
    logger.info(`Scraping complete`, { result: scraper.result });
  } else if (validation.nextStep === "retryScraping" && attempt > 0) {
    metadata.root.append("logs", {
      type: "error",
      message: "Aborting task run: retry scraping",
    });
    throw new AbortTaskRunError("Retry scraping");
  } else if (validation.severity === "critical") {
    logger.info(`Generating new pattern for the first critical error`);
    await scraper.generateNewPattern(html, validation);
    logger.info(`New pattern generated, scraping again`);
    scraper.scrapeWithPattern(html);
    logger.info(`Scraping complete`, { result: scraper.result });
  }
}
