import { getPageHtml } from "@/trigger/ai-scraping/get-page-html";
import { logger, metadata, task } from "@trigger.dev/sdk/v3";
import { extractionJob } from "./ai-scraping/extract-data-html";

interface ScrapeUrlPayload {
  url: string;
  pattern: string;
  options?: {
    maxAIScraperAttempts?: number;
  };
}

export const scrapeUrl = task({
  id: "scrape-url",
  retry: {
    maxAttempts: 5,
    factor: 3,
    minTimeoutInMs: 60_000,
    maxTimeoutInMs: 86_400_000, // 24 hours in milliseconds
    randomize: true,
  },
  run: async (payload: ScrapeUrlPayload) => {
    const { url, pattern } = payload;

    logger.info(`Scraping URL: ${url}`);
    metadata.append("logs", {
      type: "info",
      message: `Scraping URL: ${url}`,
    });
    const getHTMLResult = await getPageHtml.triggerAndWait({ url });

    if (!getHTMLResult.ok) {
      throw new Error(String(getHTMLResult.error));
    }

    const result = await extractionJob.triggerAndWait({
      url,
      pattern,
      html: getHTMLResult.output,
    });

    if (result.ok) {
      return result.output;
    }

    throw new Error(String(result.error));
  },
});
