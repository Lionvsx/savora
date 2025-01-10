"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScrapingPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleTriggerScraping = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/trigger-scraping?password=${password}`);

            if (!response.ok) {
                throw new Error("Failed to trigger scraping");
            }

            const data = await response.json() as {
                publicAccessToken: string
                batchId: string
            }

            router.push(`/trigger/batch/${data.batchId}?publicAccessToken=${data.publicAccessToken}`);

            toast.success("Scraping triggered successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-dvh w-full flex flex-col justify-center items-center relative">
            <Link href="/" className="absolute top-4 left-4">
                <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </Button>
            </Link>

            <form onSubmit={handleTriggerScraping}>
                <h1 className="text-4xl font-bold mb-8">Scraping Management</h1>

                <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter 6-digit password"
                            maxLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        onClick={handleTriggerScraping}
                        disabled={password.length !== 6 || isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Triggering..." : "Trigger Scraping"}
                    </Button>
                </div>
            </form>
        </main>
    );
}
