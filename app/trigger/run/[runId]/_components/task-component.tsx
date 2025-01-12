"use client";

import type { scrapeUrl } from "@/trigger/scrape-url";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { CheckCircle2, Info, AlertCircle, XCircle, Loader2, ArrowLeftIcon } from "lucide-react";
import { CodeBlock } from "@/components/ui/codeblock";
import { TaskLog } from "@/types/task-metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ScrapingRunComponentProps {
    runId: string;
    accessToken: string;
}

export function ScrapingRunComponent({ runId, accessToken }: ScrapingRunComponentProps) {
    const { run, error } = useRealtimeRun<typeof scrapeUrl>(runId, {
        accessToken: accessToken
    });

    const logs = run?.metadata?.logs as TaskLog[];

    if (error) return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-700">Error: {error.message}</p>
        </div>
    );

    const getIconForLogType = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-500" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const renderResultPanel = () => {
        if (!run?.output) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Waiting for results...</span>
                </div>
            );
        }

        return (
            <div className="h-full overflow-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scraping Results</h2>
                <CodeBlock
                    language="json"
                    value={JSON.stringify(run.output, null, 2)}
                />
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh]">
            {/* Left Panel - Logs */}
            <div className="w-1/2 overflow-auto border-r p-4">
                <div className="border-b pb-4 space-y-2">
                    <div className="flex flex-col items-start">
                        <Button variant='link' asChild className="px-0">
                            <Link
                                href="/test-scraping"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Scraping JOB</h1>

                    </div>
                    {run?.payload && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">URL:</span>
                            <a
                                href={run.payload.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                            >
                                {run.payload.url}
                            </a>
                        </div>
                    )}
                </div>

                {logs && (
                    <div className="space-y-4 mt-4">
                        <h2 className="text-lg font-semibold text-gray-900">Execution Log</h2>
                        <div className="space-y-2">
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-lg border bg-white"
                                >
                                    {getIconForLogType(log.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 truncate">{log.message}</p>
                                        {log.data && (
                                            <div className="mt-2 max-w-full overflow-hidden">
                                                <CodeBlock
                                                    language="json"
                                                    value={JSON.stringify(log.data, null, 2)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Results */}
            <div className="w-1/2 p-4 overflow-auto fixed right-0 top-0 bottom-0">
                {renderResultPanel()}
            </div>
        </div>
    );
}