import { Page } from "puppeteer";
export async function simulateHumanScrolling(page: Page) {
  // Get page height
  const pageHeight = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  let currentPosition = 0;

  while (currentPosition < pageHeight) {
    // Random scroll amount between 300-800 pixels
    const scrollAmount = Math.floor(Math.random() * 1500) + 1000;
    currentPosition += scrollAmount;

    await page.evaluate((scrollPos) => {
      window.scrollTo({
        top: scrollPos,
        behavior: "smooth",
      });
    }, currentPosition);

    // Random pause between 500-1500ms
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)
    );

    // Occasionally move mouse randomly
    if (Math.random() > 0.7) {
      await page.mouse.move(Math.random() * 800, Math.random() * 600, {
        steps: 5,
      });
    }
  }

  // Ensure we've reached the bottom
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
