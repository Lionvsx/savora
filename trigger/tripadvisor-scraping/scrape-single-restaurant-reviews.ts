import { cleanupHtml } from "@/functions/ai-scraping/cleanup-html";
import { createBrowserSession } from "@/functions/browser/create-session";
import { Restaurant } from "@/types/restaurant";
import { logger, task } from "@trigger.dev/sdk/v3";
import { chromium } from "playwright-extra";
import { extractionJob } from "../ai-scraping/extract-data-html";
import { redis } from "@/lib/redis";

export interface ScrapeSingleRestaurantReviewsPayload {
  restaurant: Restaurant;
}

export const scrapeSingleRestaurantReviews = task({
  id: "scrape-single-restaurant-reviews",
  queue: {
    concurrencyLimit: 3,
  },
  run: async (payload: ScrapeSingleRestaurantReviewsPayload, { ctx }) => {
    const { restaurant } = payload;
    logger.info(`Scraping reviews for restaurant: ${restaurant.name}`);

    const searchQuery = `tripadvisor restaurant paris ${restaurant.name}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;

    logger.info(`Searching for restaurant: ${restaurant.name} on Google`);

    const session = await createBrowserSession({
      geolocation: {
        city: "Paris",
        country: "FR",
      },
    });

    const browser = await chromium.connectOverCDP(session.connectUrl);
    const page = await browser.newPage();

    try {
      logger.info(`Navigating to Google search URL: ${searchUrl}`);
      await page.goto(searchUrl, {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      });

      // Find first TripAdvisor result
      const tripadvisorLink = page.locator('a[href*="tripadvisor.fr"]').first();
      const restaurantUrl = await tripadvisorLink.getAttribute("href");

      logger.info(`Found TripAdvisor URL: ${restaurantUrl}`);

      if (!restaurantUrl) {
        throw new Error("Could not find TripAdvisor URL for restaurant");
      }

      logger.info(`Navigating to TripAdvisor URL: ${restaurantUrl}`);
      await page.goto(restaurantUrl, {
        timeout: 120000,
        waitUntil: "domcontentloaded",
      });

      const pageContent = await page.content();
      await browser.close();
      const cleanedHtml = cleanupHtml(pageContent);

      logger.info(`Scraping reviews for restaurant: ${restaurant.name}`);
      const pattern = `
      reviews[] {
        title: string
        rating(from 1 to 5 as a int, not decimal): number
        text: string
        author: string
        date: string
      }
      `;

      const extractionResult = await extractionJob.triggerAndWait({
        url: restaurantUrl,
        pattern,
        html: cleanedHtml,
      });

      if (!extractionResult.ok) {
        throw new Error(String(extractionResult.error));
      }

      redis.json.arrappend(
        `restaurant:${restaurant.id}`,
        "$.reviews",
        extractionResult.output?.data.reviews
      );

      if (extractionResult.output?.data) {
        const outputKey = `scraping-output:run:${ctx.run.id}`;
        redis.set(outputKey, JSON.stringify(extractionResult.output.data));

        if (ctx.batch?.id) {
          redis.zadd(`scraping-output:batch:${ctx.batch.id}`, {
            score: Date.now(),
            member: outputKey,
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
    }
  },
});
