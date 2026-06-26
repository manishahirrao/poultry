// FlockIQ — CodeBlock Component
// File: apps/web/app/(marketing)/developers/components/CodeBlock.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.1
// Design Reference: Design Spec §7.1

'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting using regex
  const highlightedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-blue-400">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-300">$1</span>')
    .replace(/\b(const|let|var|function|return|import|export|from|async|await|if|else|for|while|class|def)\b/g, '<span class="text-purple-400">$1</span>')
    .replace(/\b(GET|POST|PUT|DELETE|curl)\b/g, '<span class="text-blue-400">$1</span>')
    .replace(/(-\w+)/g, '<span class="text-cyan-400">$1</span>');

  return (
    <div className="overflow-hidden rounded-lg bg-[#0D1117] shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-700 bg-[#161B22] px-4 py-2">
        <span className="text-sm font-medium text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="rounded px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code
          className="text-sm leading-relaxed text-gray-300 font-mono tabular-nums"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        />
      </pre>
    </div>
  );
}
