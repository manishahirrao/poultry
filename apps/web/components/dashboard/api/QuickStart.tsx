'use client';

import { useState } from 'react';
import { Copy, Code } from '@phosphor-icons/react';

export function QuickStart() {
  const [language, setLanguage] = useState<'curl' | 'python' | 'node' | 'php'>('curl');

  const codeExamples = {
    curl: `curl -X GET \\
  "https://api.FlockIQ.ai/v1/predictions?mandi=gorakhpur&days=7" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    python: `import requests

url = "https://api.FlockIQ.ai/v1/predictions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
params = {
    "mandi": "gorakhpur",
    "days": 7
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(data)`,
    node: `const fetch = require('node-fetch');

const url = 'https://api.FlockIQ.ai/v1/predictions?mandi=gorakhpur&days=7';
const options = {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
};

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log(data));`,
    php: `<?php
$url = 'https://api.FlockIQ.ai/v1/predictions?mandi=gorakhpur&days=7';
$headers = [
  'Authorization: Bearer YOUR_API_KEY'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[language]);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <Code size={20} className="text-purple-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Quick Start</h3>
          <p className="text-xs text-neutral-500">Get started with the API in minutes</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          {(['curl', 'python', 'node', 'php'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                language === lang
                  ? 'bg-brandGreen700 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative">
          <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg text-xs overflow-x-auto">
            <code>{codeExamples[language]}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
            aria-label="Copy code"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
          <span className="text-brandGreen700 font-bold">1.</span>
          <div>
            <p className="font-semibold text-neutral-900">Get your API key</p>
            <p className="text-xs text-neutral-600">Generate or copy your API key from the section above</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
          <span className="text-brandGreen700 font-bold">2.</span>
          <div>
            <p className="font-semibold text-neutral-900">Make your first request</p>
            <p className="text-xs text-neutral-600">Use the code example above to fetch predictions</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
          <span className="text-brandGreen700 font-bold">3.</span>
          <div>
            <p className="font-semibold text-neutral-900">Explore the documentation</p>
            <p className="text-xs text-neutral-600">
              <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="text-brandGreen700 hover:underline">
                View full API documentation →
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Response Example:</strong>
          </p>
          <pre className="mt-2 text-xs text-blue-900 overflow-x-auto">
{`{
  "mandi": "gorakhpur",
  "predicted_at": "2026-05-16T00:30:00+05:30",
  "p10": 155,
  "p50": 168,
  "p90": 175,
  "sell_signal": "SELL_NOW",
  "confidence": 0.89,
  "drivers": ["मांग अधिक", "आवक कम", "मौसम सामान्य"]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
