import Browserbase from "@browserbasehq/sdk";

const BROWSERBASE_API_KEY = process.env["BROWSERBASE_API_KEY"]!;
const BROWSERBASE_PROJECT_ID = process.env["BROWSERBASE_PROJECT_ID"]!;

const bb = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

export async function createBrowserSession({
  geolocation = {
    city: "Paris",
    country: "FR",
  },
}: {
  geolocation: {
    city: string;
    country: string;
  };
}) {
  const session = await bb.sessions.create({
    projectId: BROWSERBASE_PROJECT_ID,
    browserSettings: {
      solveCaptchas: true,
    },
    proxies: [
      {
        type: "browserbase",
        geolocation,
      },
    ],
  });

  return session;
}
