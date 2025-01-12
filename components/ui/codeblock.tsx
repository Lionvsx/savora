// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

'use client'

import { FC, memo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'


interface Props {
    language: string
    value: string
}

interface languageMap {
    [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
    javascript: '.js',
    python: '.py',
    java: '.java',
    c: '.c',
    cpp: '.cpp',
    'c++': '.cpp',
    'c#': '.cs',
    ruby: '.rb',
    php: '.php',
    swift: '.swift',
    'objective-c': '.m',
    kotlin: '.kt',
    typescript: '.ts',
    go: '.go',
    perl: '.pl',
    rust: '.rs',
    scala: '.scala',
    haskell: '.hs',
    lua: '.lua',
    shell: '.sh',
    sql: '.sql',
    html: '.html',
    css: '.css'
    // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
}

export const generateRandomString = (length: number, lowercase = false) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789' // excluding similar looking characters like Z, 2, I, 1, O, 0
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return lowercase ? result.toLowerCase() : result
}

const CodeBlock: FC<Props> = memo(({ language, value }) => {
    return (
        <div className="relative font-sans codeblock bg-white rounded-lg overflow-hidden max-w-full border border-gray-200">
            <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs text-gray-600 font-medium">{language}</span>
            </div>
            <div className="overflow-x-auto w-full">
                <SyntaxHighlighter
                    language={language}
                    style={oneLight}
                    PreTag="div"
                    showLineNumbers
                    customStyle={{
                        margin: 0,
                        background: 'white',
                        padding: '1rem',
                        minWidth: 'min-content'
                    }}
                    lineNumberStyle={{
                        userSelect: 'none',
                        minWidth: '2.5em',
                        paddingRight: '1em',
                        color: '#a1a1aa',
                        textAlign: 'right'
                    }}
                    codeTagProps={{
                        style: {
                            fontSize: '0.875rem',
                            fontFamily: 'var(--font-mono)',
                            whiteSpace: 'pre'
                        }
                    }}
                    wrapLines={false}
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        </div>
    )
})
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
