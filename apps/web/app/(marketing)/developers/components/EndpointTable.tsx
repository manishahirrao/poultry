// FlockIQ — EndpointTable Component
// File: apps/web/app/(marketing)/developers/components/EndpointTable.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.2
// Design Reference: Design Spec §7.2

'use client';

import { useState } from 'react';
import React from 'react';
import CodeBlock from './CodeBlock';

interface Endpoint {
  method: 'GET' | 'POST';
  endpoint: string;
  description: string;
  auth: 'API Key' | 'None';
  parameters?: string;
  response?: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    endpoint: '/v2/forecast/enterprise',
    description: '7–30 day price forecast',
    auth: 'API Key',
    parameters: 'district (string), horizon (number), confidence (array)',
    response: '{ "p50": 162.40, "p10": 158.20, "p90": 166.80, "direction": "up" }',
  },
  {
    method: 'GET',
    endpoint: '/v2/prices/live',
    description: 'Real-time mandi prices',
    auth: 'API Key',
    parameters: 'district (string)',
    response: '{ "district": "gorakhpur", "price": 162.40, "timestamp": "2026-05-30T06:00:00Z" }',
  },
  {
    method: 'GET',
    endpoint: '/v2/batch/{id}/traceability',
    description: 'FSSAI traceability PDF',
    auth: 'API Key',
    parameters: 'id (string) - batch ID',
    response: '{ "pdf_url": "https://...", "batch_id": "BATCH-001" }',
  },
  {
    method: 'POST',
    endpoint: '/v2/webhooks',
    description: 'Register event webhook',
    auth: 'API Key',
    parameters: 'url (string), events (array)',
    response: '{ "webhook_id": "WH-001", "status": "active" }',
  },
  {
    method: 'GET',
    endpoint: '/v2/feed-intel',
    description: 'Feed commodity forecast',
    auth: 'API Key',
    parameters: 'commodity (string), horizon (number)',
    response: '{ "maize_price": 2400, "trend": "stable" }',
  },
  {
    method: 'GET',
    endpoint: '/v2/flock/dashboard',
    description: 'Multi-farm overview',
    auth: 'API Key',
    parameters: 'farm_ids (array)',
    response: '{ "farms": [...], "total_birds": 50000 }',
  },
  {
    method: 'GET',
    endpoint: '/api/public/accuracy-summary',
    description: 'Live accuracy stats',
    auth: 'None',
    parameters: 'None',
    response: '{ "directionalAccuracy": 96.2, "mape30d": 4.8 }',
  },
];

export default function EndpointTable() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Endpoint
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Auth
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {endpoints.map((endpoint, index) => (
            <React.Fragment key={endpoint.endpoint}>
              <tr
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedEndpoint(expandedEndpoint === index ? null : index)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                      endpoint.method === 'GET'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                  {endpoint.endpoint}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{endpoint.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                      endpoint.auth === 'API Key'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {endpoint.auth}
                  </span>
                </td>
              </tr>
              {expandedEndpoint === index && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">Parameters</h4>
                        <p className="text-sm text-gray-600">{endpoint.parameters}</p>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">Example Response</h4>
                        <CodeBlock code={endpoint.response || '{}'} language="json" />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
