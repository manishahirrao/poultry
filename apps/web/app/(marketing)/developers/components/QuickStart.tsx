// FlockIQ — QuickStart Component
// File: apps/web/app/(marketing)/developers/components/QuickStart.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.2
// Design Reference: Design Spec §7

'use client';

import { useState } from 'react';
import CodeBlock from './CodeBlock';

type Language = 'curl' | 'python' | 'node';

const codeSnippets = {
  curl: `curl -X GET "https://api.poulse.ai/v2/forecast/enterprise" \\
  -H "Authorization: Bearer sk-pp-****" \\
  -d "district=gorakhpur&horizon=30&confidence[]=p10&confidence[]=p50&confidence[]=p90"`,

  python: `import requests

url = "https://api.poulse.ai/v2/forecast/enterprise"
headers = {
    "Authorization": "Bearer sk-pp-****"
}
params = {
    "district": "gorakhpur",
    "horizon": 30,
    "confidence": ["p10", "p50", "p90"]
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`,

  node: `const fetch = require('node-fetch');

const url = 'https://api.poulse.ai/v2/forecast/enterprise';
const headers = {
  'Authorization': 'Bearer sk-pp-****'
};
const params = new URLSearchParams({
  district: 'gorakhpur',
  horizon: 30,
  confidence: ['p10', 'p50', 'p90']
});

const response = await fetch(\`\${url}?\${params}\`, { headers });
const data = await response.json();
console.log(data);`,
};

export default function QuickStart() {
  const [activeTab, setActiveTab] = useState<Language>('curl');

  return (
    <div>
      {/* Tab Buttons */}
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {(['curl', 'python', 'node'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveTab(lang)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === lang
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'Node.js'}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <CodeBlock code={codeSnippets[activeTab]} language={activeTab} />
    </div>
  );
}
