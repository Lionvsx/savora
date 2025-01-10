import { logger } from "@trigger.dev/sdk/v3";
import { Page } from "puppeteer";

interface BlockCheckResult {
  isBlocked: boolean;
  type?: "captcha" | "security";
  message?: string;
}

export async function checkForBlocking(page: Page): Promise<BlockCheckResult> {
  try {
    const blockCheck = await page.evaluate(() => {
      const blockingIndicators = {
        captcha: [
          'iframe[src*="recaptcha"]',
          ".g-recaptcha",
          'iframe[src*="hcaptcha"]',
          '*[id*="captcha" i]',
          '*[class*="captcha" i]',
          // DataDome specific selectors
          'iframe[title*="DataDome"]',
          'iframe[src*="captcha-delivery"]',
          'noscript[src*="captcha-delivery"]',
        ],
        security: [
          // CloudFlare specific
          "#cf-wrapper",
          ".cf-error-details",
          // Akamai specific
          '#main-iframe[src*="ak-challenge"]',
        ],
      };

      // Function to check text content
      const hasBlockingText = () => {
        const blockingPhrases = [
          "access denied",
          "forbidden",
          "blocked",
          "security check",
          "verify you are human",
          "suspicious activity",
          "unusual traffic",
          "device check",
        ];

        const headingsAndParagraphs =
          document.querySelectorAll("h1, h2, h3, p");
        return Array.from(headingsAndParagraphs).some((element) => {
          const text = element.textContent?.toLowerCase() || "";
          return blockingPhrases.some((phrase) =>
            text.includes(phrase.toLowerCase())
          );
        });
      };

      // Check selectors first
      for (const [type, selectors] of Object.entries(blockingIndicators)) {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            const message = element.textContent?.trim() || `${type} detected`;
            return { found: true, type, message };
          }
        }
      }

      // Check text content
      if (hasBlockingText()) {
        return {
          found: true,
          type: "security",
          message: "Security check or blocking message detected",
        };
      }

      return { found: false };
    });

    if (blockCheck.found) {
      logger.warn(
        `Page access blocked: ${blockCheck.type} - ${blockCheck.message}`
      );
      return {
        isBlocked: true,
        type: blockCheck.type as "captcha" | "security",
        message: blockCheck.message,
      };
    }

    return { isBlocked: false };
  } catch (error) {
    logger.error("Error checking for blocking:", { error });
    return {
      isBlocked: true,
      type: "security",
      message: "Error checking page status",
    };
  }
}
