import { createBrowserSession } from "@/functions/browser/create-session";
import { configure, wrap } from "agentql";
import { chromium } from "playwright-extra";
import { logger, task } from "@trigger.dev/sdk/v3";

configure({ apiKey: process.env.AGENTQL_API_KEY });

interface ExtractDataFromHtmlPayload {
  url: string;
  pattern: string;
}

export const extractWithAgentQL = task({
  id: "extract-with-agentql",
  retry: {
    maxAttempts: 5,
    factor: 3,
    minTimeoutInMs: 60_000,
    maxTimeoutInMs: 86_400_000, // 24 hours in milliseconds
    randomize: true,
  },
  run: async (payload: ExtractDataFromHtmlPayload) => {
    logger.info("Starting extraction with AgentQL", { url: payload.url });

    const session = await createBrowserSession({
      geolocation: {
        city: "Paris",
        country: "FR",
      },
    });

    const browser = await chromium.connectOverCDP(session.connectUrl);

    try {
      const page = await wrap(await browser.newPage());
      await page.goto(payload.url, { timeout: 120000 });
      logger.info("Navigation complete");

      // Use AgentQL to extract data based on the provided pattern
      const response = await page.queryElements(payload.pattern);

      await browser.close();

      return response;
    } catch (error) {
      logger.error("Error extracting data with AgentQL", { error });
      throw error;
    }
  },
});
