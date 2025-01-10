import { cleanupHtml } from "@/functions/ai-scraping/cleanup-html";
import { createBrowserSession } from "@/functions/browser/create-session";
import { Restaurant } from "@/types/restaurant";
import { logger, task } from "@trigger.dev/sdk/v3";
import puppeteer from "puppeteer";
import { extractionJob } from "../ai-scraping/extract-data-html";
import { redis } from "@/lib/redis";
import { checkForBlocking } from "@/functions/ai-scraping/check-capcha";

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

    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    try {
      const page = await browser.newPage();

      logger.info(`Navigating to Google search URL: ${searchUrl}`);
      // Prevent all assets from loading, images, stylesheets etc
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (
          ["script", "stylesheet", "image", "media", "font"].includes(
            request.resourceType()
          )
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto(searchUrl, {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      });

      // Find first TripAdvisor result
      const tripadvisorLink = await page.$('a[href*="tripadvisor.fr"]');
      const restaurantUrl = await tripadvisorLink?.evaluate((el) =>
        el.getAttribute("href")
      );

      logger.info(`Found TripAdvisor URL: ${restaurantUrl}`);

      if (!restaurantUrl) {
        throw new Error("Could not find TripAdvisor URL for restaurant");
      }

      logger.info(`Navigating to TripAdvisor URL: ${restaurantUrl}`);
      await page.goto(restaurantUrl, {
        timeout: 120000,
        waitUntil: "domcontentloaded",
      });

      const blockCheck = await checkForBlocking(page);

      if (blockCheck.isBlocked) {
        throw new Error(
          `Page access blocked: ${blockCheck.type} - ${blockCheck.message}`
        );
      }

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

      const [dbReviewsCount] = await redis.json.arrlen(
        restaurant.id,
        "$.reviews"
      );

      if (dbReviewsCount && dbReviewsCount === 0) {
        redis.json.arrappend(
          restaurant.id,
          "$.reviews",
          ...extractionResult.output?.data.reviews
        );
      }

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

      return {
        reviews: extractionResult.output?.data.reviews,
      };
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
    }
  },
});
