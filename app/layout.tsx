import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/sonner";

const FONT_SANS = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Savora",
  description: "Discover the best restaurants in Paris",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${FONT_SANS.className} antialiased bg-gray-50 scroll-smooth`}
      >
        <ThemeProvider forcedTheme="light" defaultTheme="light">
          <Toaster richColors position="top-center" theme="light" />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
