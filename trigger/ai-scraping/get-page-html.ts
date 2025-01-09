import { checkForBlocking } from "@/functions/ai-scraping/check-capcha";
import { cleanupHtml } from "@/functions/ai-scraping/cleanup-html";
import { getCachedHTML } from "@/functions/ai-scraping/instructions/database";
import { createBrowserSession } from "@/functions/browser/create-session";
import { simulateHumanScrolling } from "@/functions/browser/simulate-human-behavior";
import { logger, task } from "@trigger.dev/sdk/v3";
import { chromium } from "playwright-extra";

export const getPageHtml = task({
  id: "get-page-html",
  retry: {
    maxAttempts: 3,
    factor: 3,
    minTimeoutInMs: 60_000,
    maxTimeoutInMs: 86_400_000, // 24 hours in milliseconds
    randomize: true,
  },
  run: async ({ url }: { url: string }): Promise<string> => {
    const cachedHTML = await getCachedHTML(url);

    if (cachedHTML) {
      return cachedHTML;
    }

    const session = await createBrowserSession({
      geolocation: {
        city: "Paris",
        country: "FR",
      },
    });

    const browser = await chromium.connectOverCDP(session.connectUrl);

    try {
      const page = await browser.newPage();

      logger.info(`Navigating to URL: ${url}`);

      await page.goto(url, { timeout: 120000 });

      const blockCheck = await checkForBlocking(page);

      if (blockCheck.isBlocked) {
        throw new Error(
          `Page access blocked: ${blockCheck.type} - ${blockCheck.message}`
        );
      }

      logger.info(`Scrolling on the page`);

      await simulateHumanScrolling(page);

      // Clean up the page content
      const pageContent = await page.content();
      const cleanedHtml = cleanupHtml(pageContent);

      await browser.close();

      return cleanedHtml;
    } catch (error) {
      logger.error(`Error getting page HTML`, { error });
      throw error;
    }
  },
});
