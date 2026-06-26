// FlockIQ — ApiPlayground Component
// File: apps/web/app/(marketing)/developers/components/ApiPlayground.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.3
// Design Reference: Design Spec §7

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import JsonViewer from './JsonViewer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ApiPlayground() {
  const [endpoint, setEndpoint] = useState('/api/public/accuracy-summary');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: cachedData } = useSWR(
    endpoint === '/api/public/accuracy-summary' ? endpoint : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      if (endpoint === '/api/public/accuracy-summary') {
        // Use the public endpoint without auth
        const data = await fetcher(endpoint);
        setResponse(data);
      } else {
        // For authenticated endpoints, show mock response
        setResponse({
          message: 'This endpoint requires authentication',
          note: 'Login to test with your API key',
          mock_response: {
            status: 'success',
            data: 'Sample response data',
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  const endpoints = [
    '/api/public/accuracy-summary',
    '/v2/forecast/enterprise',
    '/v2/prices/live',
    '/v2/batch/{id}/traceability',
  ];

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      {/* Endpoint Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Select Endpoint
        </label>
        <select
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {endpoints.map((ep) => (
            <option key={ep} value={ep}>
              {ep}
            </option>
          ))}
        </select>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isLoading}
        className="mb-6 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Loading...' : 'Execute Request'}
      </button>

      {/* Response Display */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-900/50 border border-red-700 p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {response && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Response</h3>
          <JsonViewer data={response} />
        </div>
      )}

      {!response && !error && !isLoading && endpoint === '/api/public/accuracy-summary' && cachedData && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Cached Response</h3>
          <JsonViewer data={cachedData} />
        </div>
      )}
    </div>
  );
}
