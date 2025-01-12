import { scrapeUrl } from "@/trigger/scrape-url";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, pattern } = await request.json();

    console.log("url", url);
    console.log("pattern", pattern);

    if (!url || !pattern) {
      return NextResponse.json(
        { error: "URL and pattern are required" },
        { status: 400 }
      );
    }

    const handler = await scrapeUrl.trigger({
      url,
      pattern,
      options: {
        stealth: true,
      },
    });

    return NextResponse.json({
      runId: handler.id,
      publicAccessToken: handler.publicAccessToken,
    });
  } catch (error) {
    console.error("Test scraping error:", error);
    return NextResponse.json(
      { error: "Failed to trigger test scraping" },
      { status: 500 }
    );
  }
}
