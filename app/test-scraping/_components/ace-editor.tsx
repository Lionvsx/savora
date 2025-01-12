"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AceEditor = dynamic(
    async () => {
        const ace = await import('react-ace');
        await import('ace-builds/src-noconflict/mode-json');
        await import('ace-builds/src-noconflict/theme-monokai');
        await import('ace-builds/src-noconflict/ext-language_tools');
        return ace;
    },
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100" />
    }
);

interface PatternEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function PatternEditor({ value, onChange }: PatternEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="h-full w-full">
            <AceEditor
                // @ts-expect-error AceEditor is not typed
                mode="json"
                theme="monokai"
                name="pattern-editor"
                value={value}
                onChange={onChange}
                width="100%"
                height="100%"
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                    useWorker: false
                }}
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
}
