// FlockIQ — SdkSection Component
// File: apps/web/app/(marketing)/developers/components/SdkSection.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.2
// Design Reference: Design Spec §7

export default function SdkSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Python SDK */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-2xl">🐍</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Python SDK</h3>
            <p className="text-sm text-gray-600">Coming in Phase 2</p>
          </div>
        </div>
        <p className="mb-4 text-gray-600">
          Official Python SDK with type hints, async support, and comprehensive error handling.
        </p>
        <div className="rounded bg-gray-100 p-3 font-mono text-sm text-gray-700">
          pip install FlockIQ-python
        </div>
      </div>

      {/* Node.js SDK */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <span className="text-2xl">🟢</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Node.js SDK</h3>
            <p className="text-sm text-gray-600">Coming in Phase 2</p>
          </div>
        </div>
        <p className="mb-4 text-gray-600">
          Official Node.js SDK with TypeScript support, promise-based API, and middleware hooks.
        </p>
        <div className="rounded bg-gray-100 p-3 font-mono text-sm text-gray-700">
          npm install @flockiq/node-sdk
        </div>
      </div>
    </div>
  );
}
