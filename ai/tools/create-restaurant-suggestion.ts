import { tool as createTool } from "ai";
import { z } from "zod";

export const restaurantSuggestionTool = createTool({
  description:
    "Create a personalized restaurant suggestion UI card based on index results",
  parameters: z.object({
    name: z.string().describe("The name of the restaurant"),
    cuisine: z.string().describe("The cuisine of the restaurant"),
    rating: z.number().describe("The rating of the restaurant"),
    priceRange: z
      .enum(["$", "$$", "$$$", "$$$$"])
      .describe("The price range of the restaurant"),
    address: z.string().describe("The full address of the restaurant"),
    reason: z
      .string()
      .describe(
        "Describe why do you think this restaurant is a good suggestion for the user"
      ),
    featured: z
      .boolean()
      .describe(
        "Wether your want to highlight this restaurant in the UI. Only one restaurant should be featured."
      ),
  }),
});
