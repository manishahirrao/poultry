// FlockIQ — Developer & API Page Client Component
// File: apps/web/app/(marketing)/developers/DevelopersPageClient.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007
// Design Reference: Design Spec §7

'use client';

import { useState } from 'react';
import CodeBlock from './components/CodeBlock';
import QuickStart from './components/QuickStart';
import EndpointTable from './components/EndpointTable';
import RateLimits from './components/RateLimits';
import ApiPlayground from './components/ApiPlayground';
import SdkSection from './components/SdkSection';

export default function DevelopersPageClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              The Poultry Intelligence API
            </h1>
            <p className="mb-8 text-xl text-gray-600 sm:text-2xl">
              95%+ accuracy. Production-ready.
            </p>
            
            {/* Hero Code Block */}
            <CodeBlock
              code={`curl -X GET "https://api.poulse.ai/v2/forecast/enterprise" \\
  -H "Authorization: Bearer sk-pp-****" \\
  -d "district=gorakhpur&horizon=30&confidence[]=p10&confidence[]=p50&confidence[]=p90"`}
              language="bash"
            />
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Quick Start</h2>
            <p className="text-lg text-gray-600">
              Get started with the FlockIQ API in minutes. Choose your language below.
            </p>
          </div>
          <QuickStart />
        </div>
      </section>

      {/* API Overview Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">API Overview</h2>
            <p className="text-lg text-gray-600">
              Access 7-day price forecasts, real-time mandi prices, FSSAI traceability reports, and more.
            </p>
          </div>
          <EndpointTable />
        </div>
      </section>

      {/* Rate Limits Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Rate Limits</h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your integration needs.
            </p>
          </div>
          <RateLimits />
        </div>
      </section>

      {/* API Playground Section */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-white">API Playground</h2>
            <p className="text-lg text-gray-300">
              Test the API directly in your browser. No login required for public endpoints.
            </p>
          </div>
          <ApiPlayground />
        </div>
      </section>

      {/* SDK Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">SDKs</h2>
            <p className="text-lg text-gray-600">
              Official SDKs for popular languages. Coming soon in Phase 2.
            </p>
          </div>
          <SdkSection />
        </div>
      </section>

      {/* Full Documentation Link */}
      <section className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Need More Details?</h3>
            <p className="mb-4 text-gray-600">
              View the complete OpenAPI/Swagger documentation with all endpoints, schemas, and examples.
            </p>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 transition-colors"
            >
              View Full API Documentation →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
