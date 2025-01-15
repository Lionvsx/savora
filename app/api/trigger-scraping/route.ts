import { redis } from "@/lib/redis";
import {
  scrapeSingleRestaurantReviews,
  ScrapeSingleRestaurantReviewsPayload,
} from "@/trigger/tripadvisor-scraping/scrape-single-restaurant-reviews";
import { Restaurant } from "@/types/restaurant";
import { BatchItem } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";

const SCRAPING_PASSWORD = process.env.SCRAPING_PASSWORD;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const password = searchParams.get("password");

  if (!password || password !== SCRAPING_PASSWORD) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  const restaurantKeys = await getRestaurantKeys();

  const restaurantsToScrape = [];

  console.log(`Found ${restaurantKeys.length} restaurant keys`);

  const pipeline = redis.pipeline();
  restaurantKeys.forEach((key) => {
    pipeline.json.get(key);
  });

  const results = await pipeline.exec<Restaurant[]>();

  for (const restaurant of results) {
    if (
      restaurant?.reviewCount &&
      restaurant?.reviewCount &&
      restaurant.reviewCount > 100 &&
      restaurant.rating &&
      Number(restaurant.rating) > 9.4
    ) {
      restaurantsToScrape.push(restaurant);
    }
  }

  console.log(`Found ${restaurantsToScrape.length} restaurants to scrape`);

  const items: BatchItem<ScrapeSingleRestaurantReviewsPayload>[] =
    restaurantsToScrape.map((restaurant) => ({
      payload: { restaurant },
      options: {
        idempotencyKey: `scraping-reviews-v4-${restaurant.id}`,
      },
    }));

  const handler = await scrapeSingleRestaurantReviews.batchTrigger(items);

  return NextResponse.json({
    batchId: handler.batchId,
    publicAccessToken: handler.publicAccessToken,
  });
}

async function getRestaurantKeys() {
  let cursor = "0";
  const restaurantKeys: string[] = [];

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "restaurant:*",
      count: 500,
    });
    restaurantKeys.push(...keys);

    cursor = nextCursor;
  } while (cursor !== "0");

  return restaurantKeys;
}
