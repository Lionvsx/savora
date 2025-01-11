import { restaurantSuggestionTool } from "@/ai/tools/create-restaurant-suggestion";
import { generateEmbedding } from "@/lib/utils/embeddings";
import { index } from "@/lib/vector";
import { VectorMetadata } from "@/types/vector";
import { groq } from "@ai-sdk/groq";
import { createDataStreamResponse, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // immediately start streaming (solves RAG issues with status, etc.)
  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeData("starting rag...");

      const userQuery = messages[messages.length - 1].content;

      const queryEmbedding = await generateEmbedding(userQuery);

      const results = await index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
      });

      const formattedResults = results.map((result) => {
        const metadata = result.metadata as VectorMetadata;
        return {
          name: metadata?.restaurant.name,
          cuisine: metadata?.restaurant.cuisine,
          rating: metadata?.restaurant.rating,
          priceRange: metadata?.restaurant.priceRange,
          address: metadata?.restaurant.street,
          review: metadata?.review,
        };
      });

      const result = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: `You are a helpful restaurant recommendation assistant powered by real-time restaurant data. Your primary role is to analyze and use the provided restaurant data (RAG) to make informed suggestions.

IMPORTANT: You must ALWAYS:
1. Base your recommendations ONLY on the provided restaurant data
2. Include specific quotes from customer reviews to support your suggestions
3. Reference actual details like price, location, and cuisine from the data
4. Never make up or assume information not present in the data
5. Use the suggestRestaurant tool to format responses as UI cards

SUGGESTION REQUIREMENTS:
- Provide between 3 to 5 restaurant suggestions only
- ALWAYS start with your top recommendation as the featured pick (only one featured pick allowed)
- If a restaurant appears multiple times in the results, mention this in the description as it indicates consistent positive experiences
- NEVER suggest the same restaurant twice
- Each suggestion must include a detailed explanation (2-3 sentences) of why it's a good match, incorporating:
  * Specific quotes from reviews
  * Notable features or specialties
  * Relevance to the user's request
  * Multiple appearances in results (if applicable)

When responding:
- If the provided restaurants don't match the user's needs, explicitly state this
- If the user's request is unclear, ask for clarification about cuisine, price range, or occasion
- Keep suggestions focused on the actual restaurants in the RAG data
- Format each suggestion using the suggestRestaurant tool for consistent UI presentation
- Always answer in the same language as the user's query

RESTAURANT DATA:
${JSON.stringify(formattedResults, null, 2)}

Remember: Your recommendations must be grounded in the real restaurant data provided above, not general knowledge. Only suggest and reference restaurants from this specific dataset.`,
        messages: [
          {
            role: "user",
            content:
              "Based on the restaurant data provided, analyze the options and suggest the most suitable restaurants. For each suggestion, highlight specific details from their reviews, location, price range, and cuisine type that make them good matches. Format each suggestion using the suggestRestaurant tool.",
          },
          {
            role: "user",
            content: userQuery,
          },
        ],
        tools: {
          suggestRestaurant: restaurantSuggestionTool,
        },
        maxSteps: 6,
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      console.error(error);
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
