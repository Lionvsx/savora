"use client";

import { useRealtimeBatch } from "@trigger.dev/react-hooks";
import { CheckCircle2, Clock, AlertCircle, Loader2, HelpCircle } from "lucide-react";

interface BatchComponentProps {
    batchId: string;
    accessToken: string;
}

type RunStatus = "WAITING_FOR_DEPLOY" | "QUEUED" | "EXECUTING" | "REATTEMPTING" |
    "FROZEN" | "COMPLETED" | "CANCELED" | "FAILED" | "CRASHED" |
    "INTERRUPTED" | "SYSTEM_FAILURE" | "DELAYED" | "EXPIRED" | "TIMED_OUT";

export function BatchComponent({ batchId, accessToken }: BatchComponentProps) {
    const { runs, error } = useRealtimeBatch(batchId, {
        accessToken: accessToken
    });

    if (error) return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-700">Error: {error.message}</p>
        </div>
    );

    return (
        <div className="space-y-6 p-4">
            <div className="border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Batch: {batchId}</h1>
                <p className="text-sm text-gray-500 mt-1">Total Runs: {runs.length}</p>
            </div>

            <div className="space-y-4">
                {runs.map((run) => (
                    <div
                        key={run.id}
                        className="border rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Run ID:</span>
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                        {run.id}
                                    </code>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(run.status)}`}>
                                        {run.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-gray-400">
                                {getStatusIcon(run.status)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStatusColor(status: RunStatus) {
    switch (status) {
        case "COMPLETED":
            return "bg-green-100 text-green-800";
        case "EXECUTING":
        case "REATTEMPTING":
            return "bg-blue-100 text-blue-800";
        case "FAILED":
        case "CRASHED":
        case "SYSTEM_FAILURE":
            return "bg-red-100 text-red-800";
        case "QUEUED":
        case "WAITING_FOR_DEPLOY":
        case "DELAYED":
            return "bg-yellow-100 text-yellow-800";
        case "FROZEN":
        case "INTERRUPTED":
            return "bg-orange-100 text-orange-800";
        case "CANCELED":
        case "EXPIRED":
        case "TIMED_OUT":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function getStatusIcon(status: RunStatus) {
    const iconProps = { size: 20 };

    switch (status) {
        case "COMPLETED":
            return <CheckCircle2 {...iconProps} className="text-green-600" />;
        case "EXECUTING":
        case "REATTEMPTING":
            return <Loader2 {...iconProps} className="text-blue-600 animate-spin" />;
        case "FAILED":
        case "CRASHED":
        case "SYSTEM_FAILURE":
            return <AlertCircle {...iconProps} className="text-red-600" />;
        case "QUEUED":
        case "WAITING_FOR_DEPLOY":
        case "DELAYED":
            return <Clock {...iconProps} className="text-yellow-600" />;
        case "FROZEN":
        case "INTERRUPTED":
        case "CANCELED":
        case "EXPIRED":
        case "TIMED_OUT":
            return <HelpCircle {...iconProps} className="text-gray-600" />;
        default:
            return <HelpCircle {...iconProps} className="text-gray-600" />;
    }
}
