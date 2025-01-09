"use server";

import { redis } from "@/lib/redis";
import { DatabaseInstruction, ScrapingInstructions } from "@/types/ai-scraping";
import { openai } from "@ai-sdk/openai";
import { generateId, generateObject } from "ai";
import { z } from "zod";

export async function updateInstructions({
  instructionsId,
  instructions,
  url,
  pattern,
}: {
  instructionsId: string;
  instructions: ScrapingInstructions;
  url: string;
  pattern: string;
}) {
  // Extract root domain from URL
  const domain = new URL(url).hostname.replace("www.", "");

  // Add validation to ensure no null values
  if (
    !instructions.instructions ||
    !instructions.name ||
    !instructions.description
  ) {
    throw new Error("Instructions, name, and description are required");
  }

  const instructionsObject = {
    id: instructionsId,
    instructions: instructions.instructions,
    name: instructions.name,
    description: instructions.description,
    url,
    pattern,
  };

  // Validate object has no null values
  Object.values(instructionsObject).forEach((value) => {
    if (value === null || value === undefined) {
      throw new Error("Null values are not allowed in instructions object");
    }
  });

  // Save the instructions with the ID
  await redis.hset(instructionsId, instructionsObject);

  // Add to index of instructions for this domain
  const domainIndex = `domain:${domain}`;
  await redis.sadd(domainIndex, instructionsId);

  return instructionsObject;
}

export async function saveInstructions({
  instructions,
  url,
  pattern,
}: {
  instructions: ScrapingInstructions;
  url: string;
  pattern: string;
}): Promise<DatabaseInstruction> {
  // Extract root domain from URL
  const domain = new URL(url).hostname.replace("www.", "");

  const id = generateId(10);

  // Generate unique ID for instructions
  const instructionsId = `instructions:${domain}:${id}`;

  const intructionObject = {
    id: instructionsId,
    instructions: instructions.instructions,
    name: instructions.name,
    description: instructions.description,
    url,
    pattern,
  };

  // Save the instructions with the ID
  await redis.hset(instructionsId, intructionObject);

  // Add to index of instructions for this domain
  const domainIndex = `domain:${domain}`;
  await redis.sadd(domainIndex, instructionsId);

  return intructionObject;
}

export async function getInstructionsForURL(url: string) {
  const instructionsId = await redis.get(`url:${url}`);
  const instructions = (await redis.hgetall(
    instructionsId as string
  )) as DatabaseInstruction;
  return instructions;
}

export async function chooseInstructionsWithAI({
  pattern,
  url,
}: {
  pattern: string;
  url: string;
}): Promise<DatabaseInstruction | null> {
  const domain = new URL(url).hostname.replace("www.", "");

  const instructionKeys = await redis.smembers(`domain:${domain}`);

  if (instructionKeys.length === 0) {
    return null;
  }

  const pipeline = redis.pipeline();
  for (const key of instructionKeys) {
    pipeline.hgetall(key);
  }
  const results = (await pipeline.exec()) as DatabaseInstruction[];

  // No instructions found for this domain
  if (!results || results.length === 0) {
    return null;
  }

  // Use AI to find the best matching instructions
  const systemPrompt = `
You are an AI that helps choose the best scraping pattern for a webpage.
You must ONLY return a pattern index if there is an EXACT match between the target pattern and an existing pattern.
Compare the target pattern with existing patterns character by character.
Return -1 unless you find a 100% exact string match (case sensitive).
Only return the index number (0-based) of the exact matching pattern, or -1 if none match perfectly.
No explanation needed, just the number.`;

  const userPrompt = `
Target pattern:
${pattern}

Target URL:
${url}

Existing instructions with their patterns:
${results
  .slice(0, 15)
  .map((r, i) => `${i}. Pattern: "${r.pattern}"`)
  .join("\n")}

Which pattern EXACTLY matches the target pattern? Return -1 unless there's a perfect match.`;

  try {
    const response = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      schema: z.object({
        index: z.number().describe("The index of the best matching pattern"),
      }),
      maxRetries: 2,
    });

    const bestIndex = response.object.index;

    // No suitable match found
    if (bestIndex === -1) {
      return null;
    }

    // Return the best matching instructions
    return results[bestIndex] as DatabaseInstruction;
  } catch (err) {
    console.error("Error choosing instructions:", err);
    return null;
  }
}

export async function cacheHTML(url: string, html: string) {
  // Create a cache key using the URL
  const cacheKey = `html:${url}`;

  // Cache the HTML content with a 24-hour expiration
  await redis.setex(cacheKey, 24 * 60 * 60, html);
}

export async function getCachedHTML(url: string): Promise<string | null> {
  const cacheKey = `html:${url}`;
  const html = await redis.get<string>(cacheKey);
  return html;
}
