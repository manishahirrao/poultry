'use client';

import { useState, useCallback } from 'react';
import { Play, Copy, Warning, Clock, CheckCircle, XCircle } from '@phosphor-icons/react';

interface ApiPlaygroundProps {
  apiKey: string | null;
}

interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  responseTime: number;
}

export function ApiPlayground({ apiKey }: ApiPlaygroundProps) {
  const [endpoint, setEndpoint] = useState('/api/v2/forecast/enterprise');
  const [district, setDistrict] = useState('gorakhpur');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [confidenceP10, setConfidenceP10] = useState(true);
  const [confidenceP50, setConfidenceP50] = useState(true);
  const [confidenceP90, setConfidenceP90] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const districts = [
    'gorakhpur', 'deoria', 'kushinagar', 'maharajganj', 'basti', 'sant_kabir_nagar'
  ];

  const handleSendRequest = useCallback(async () => {
    if (!apiKey) {
      setError('API key is required. Please generate an API key first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const requestBody: any = {
        mandis: [district],
        horizon_days: 7,
      };

      if (dateFrom) requestBody.date_from = dateFrom;
      if (dateTo) requestBody.date_to = dateTo;
      
      if (confidenceP10 || confidenceP50 || confidenceP90) {
        requestBody.confidence = [];
        if (confidenceP10) requestBody.confidence.push('p10');
        if (confidenceP50) requestBody.confidence.push('p50');
        if (confidenceP90) requestBody.confidence.push('p90');
      }

      const res = await fetch('https://api.FlockIQ.ai' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        responseTime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute request');
    } finally {
      setLoading(false);
    }
  }, [apiKey, endpoint, district, dateFrom, dateTo, confidenceP10, confidenceP50, confidenceP90]);

  const handleCopyAsCurl = useCallback(() => {
    if (!apiKey) return;

    const requestBody: any = {
      mandis: [district],
      horizon_days: 7,
    };

    if (dateFrom) requestBody.date_from = dateFrom;
    if (dateTo) requestBody.date_to = dateTo;
    
    if (confidenceP10 || confidenceP50 || confidenceP90) {
      requestBody.confidence = [];
      if (confidenceP10) requestBody.confidence.push('p10');
      if (confidenceP50) requestBody.confidence.push('p50');
      if (confidenceP90) requestBody.confidence.push('p90');
    }

    const curlCommand = `curl -X POST https://api.FlockIQ.ai${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $FlockIQ_API_KEY" \\
  -d '${JSON.stringify(requestBody)}'`;

    navigator.clipboard.writeText(curlCommand);
  }, [apiKey, endpoint, district, dateFrom, dateTo, confidenceP10, confidenceP50, confidenceP90]);

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-brandGreen100 flex items-center justify-center">
          <Play size={20} className="text-brandGreen700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">API Playground</h3>
          <p className="text-xs text-neutral-500">Test API endpoints in real-time</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Warning size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">⚠ Live API — calls are counted</p>
          <p className="text-xs text-amber-700 mt-1">
            All requests made from this playground use your real API key and count toward your rate limit quota.
          </p>
        </div>
      </div>

      {/* Endpoint Selector */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-neutral-700 mb-2 block">
          Endpoint
        </label>
        <select
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="w-full px-4 py-3 bg-neutral-100 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brandGreen700"
        >
          <option value="/api/v2/forecast/enterprise">POST /api/v2/forecast/enterprise</option>
        </select>
      </div>

      {/* Parameters */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-semibold text-neutral-700 mb-2 block">
            District
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-100 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brandGreen700"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-neutral-700 mb-2 block">
              Date From (optional)
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-100 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brandGreen700"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-700 mb-2 block">
              Date To (optional)
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-100 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brandGreen700"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-neutral-700 mb-2 block">
            Confidence Levels
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confidenceP10}
                onChange={(e) => setConfidenceP10(e.target.checked)}
                className="w-4 h-4 text-brandGreen700 rounded focus:ring-brandGreen700"
              />
              <span className="text-sm text-neutral-700">P10 (Optimistic)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confidenceP50}
                onChange={(e) => setConfidenceP50(e.target.checked)}
                className="w-4 h-4 text-brandGreen700 rounded focus:ring-brandGreen700"
              />
              <span className="text-sm text-neutral-700">P50 (Median)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confidenceP90}
                onChange={(e) => setConfidenceP90(e.target.checked)}
                className="w-4 h-4 text-brandGreen700 rounded focus:ring-brandGreen700"
              />
              <span className="text-sm text-neutral-700">P90 (Pessimistic)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSendRequest}
          disabled={loading || !apiKey}
          className="flex-1 px-4 py-3 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Clock size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Play size={16} />
              Send Request
            </>
          )}
        </button>
        <button
          onClick={handleCopyAsCurl}
          disabled={!apiKey}
          className="px-4 py-3 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Copy size={16} />
          Copy as cURL
        </button>
      </div>

      {/* Response Section */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          {/* Response Header */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              {response.status >= 200 && response.status < 300 ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <XCircle size={20} className="text-red-600" />
              )}
              <span className="text-sm font-semibold text-neutral-900">
                {response.status} {response.statusText}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock size={14} />
              <span>{response.responseTime}ms</span>
            </div>
          </div>

          {/* Response Body */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="h-[400px] overflow-auto bg-neutral-50 p-4">
              <pre className="text-sm text-neutral-900 font-mono whitespace-pre-wrap">
                {formatJson(response.data)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
