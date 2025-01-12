"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PatternEditor } from "./_components/ace-editor";

const formSchema = z.object({
    url: z.string().url("Please enter a valid URL"),
    pattern: z.string().min(1, "Pattern is required"),
});

type FormValues = z.infer<typeof formSchema>;

const EXAMPLE_QUERIES = [
    {
        name: "TripAdvisor Restaurant Reviews",
        url: "https://www.tripadvisor.fr/Restaurant_Review-g187147-d742400-Reviews-La_Jacobine-Paris_Ile_de_France.html",
        pattern: `reviews[] {
    title: string
    rating(from 1 to 5 as a int, not decimal): number
    text: string
    author: string
    date: string
}`
    },
    {
        name: "Amazon Product Details",
        url: "https://www.amazon.fr/Apple-MacBook-Ordinateur-portable-c%C5%93urs/dp/B0DLHGW8SV?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dib=eyJ2IjoiMSJ9.4R8VcL6WBEplcOfXd5CfDvywnWzqeXghvCMoZ9w69bCUV0dif07hwCFqDtTAUVFVAq1jpjON74aia_rLD6UB934iB3tcSvmXHwv5K1-W2jByuOkDVD8FEsPYTDaQx5C5H5Vz7tSe5PCiRGg8rqGVAHrd9HZtoXidd3XV4S6kDmLmyvCVbKEzU_cpzuHGRu_C_P4flaCD2u98lAhDEfugomJPlIjpb-yAeEyNMwvLYNI4DHpIQbC6ctK8R-FdhfKYX5uAu6hjalJivJvZPuKukIiZNl39uq8s9hmcKGOnvr7_wo8c1B787tPnBDWAe2VsWneA57dhuqLyIRp1b3sQmIhCUc_3HrzBJmuIINQl-w1T-442Ev6ml_PUdBiIrlrckEaQTBhs81-Xwc0vd8frOudPpL3NUgmucDoAb6pKg5mDMOCM1bHYc0eLI83wTWIt.sz_jSxXJClbLPLTxyoqslwhd34YduVAyqqYOJUlnHdA&dib_tag=se&keywords=macbook+pro+m1&qid=1736630738&sr=8-3",
        pattern: `product {
    title: string
    price(in euros, without currency symbol): number
    rating(out of 5 stars): number
    reviews_count: number
    availability: string
}`
    },
    {
        name: "Hacker News",
        url: "https://news.ycombinator.com/",
        pattern: `stories[] {
    title: string
    points: number 
    author: string
    time: string
    comments_count: number
    url: string
}`
    }
];

export default function TestScraping() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: "",
            pattern: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/test-scraping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to trigger test scraping");
            }

            const data = await response.json() as {
                publicAccessToken: string;
                runId: string;
            };

            router.push(`/trigger/run/${data.runId}?publicAccessToken=${data.publicAccessToken}`);
            toast.success("Test scraping triggered successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (example: typeof EXAMPLE_QUERIES[0]) => {
        form.setValue("url", example.url);
        form.setValue("pattern", example.pattern);
    };

    return (
        <main className="h-dvh w-full flex flex-col justify-center items-center relative p-6">
            <Link href="/" className="absolute top-4 left-4">
                <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </Button>
            </Link>

            <h1 className="text-4xl font-bold text-center mb-8">Test URL Scraping</h1>

            <div className="w-full max-w-6xl flex gap-6">
                {/* Form Section */}
                <div className="flex-1 space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="url" className="text-sm font-medium">
                                URL to Scrape
                            </label>
                            <Input
                                id="url"
                                {...form.register("url")}
                                placeholder="Enter URL (e.g., https://example.com)"
                            />
                            {form.formState.errors.url && (
                                <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="pattern" className="text-sm font-medium">
                                Scraping Pattern
                            </label>
                            <div className="h-[300px] border rounded-md overflow-hidden">
                                <PatternEditor
                                    value={form.watch("pattern")}
                                    onChange={(value) => form.setValue("pattern", value)}
                                />
                            </div>
                            {form.formState.errors.pattern && (
                                <p className="text-sm text-red-500">{form.formState.errors.pattern.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Launching scraping job..." : "Launch Scraping Job"}
                        </Button>
                    </form>
                </div>

                {/* Examples Section */}
                <div className="w-80 space-y-4">
                    <h2 className="text-lg font-semibold">Example Queries</h2>
                    <div className="space-y-3">
                        {EXAMPLE_QUERIES.map((example, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleExampleClick(example)}
                            >
                                <h3 className="font-medium mb-2">{example.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{example.url}</p>
                                <p className="text-xs text-gray-400 mt-1">Click to use this example</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg mt-6">
                        <h3 className="font-medium mb-2">How to use</h3>
                        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                            <li>Click an example to pre-fill the form</li>
                            <li>Pattern uses CSS selectors</li>
                            <li>Results are returned as JSON</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
