import { createScrapingPattern } from "@/functions/ai-scraping/create-scraping-pattern";
import {
  chooseInstructionsWithAI,
  saveInstructions,
} from "@/functions/ai-scraping/instructions/database";
import { DatabaseInstruction } from "@/types/ai-scraping";
import { logger, metadata, task } from "@trigger.dev/sdk/v3";

interface ChooseInstructionsPayload {
  pattern: string;
  html: string;
  url: string;
}

export const chooseInstructions = task({
  id: "choose-instructions",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60_000,
    factor: 2,
  },
  run: async ({ pattern, url, html }: ChooseInstructionsPayload) => {
    let databaseInstructions: DatabaseInstruction | null = null;

    databaseInstructions = await chooseInstructionsWithAI({ pattern, url });

    if (databaseInstructions) {
      logger.info(`Instructions found, using them`, { databaseInstructions });
      metadata.root.append("logs", {
        type: "info",
        message: `Instructions found, using them`,
      });
    }

    if (!databaseInstructions) {
      logger.info(`No instructions found, creating new ones`);
      metadata.root.append("logs", {
        type: "info",
        message: `No instructions found, creating new ones`,
      });

      const newInstructions = await createScrapingPattern({
        html,
        pattern,
      });

      const savedInstructions = await saveInstructions({
        instructions: newInstructions,
        url,
        pattern,
      });

      databaseInstructions = savedInstructions;
    }

    if (!databaseInstructions) {
      throw new Error("Failed to create instructions");
    }

    return databaseInstructions;
  },
});
