// FlockIQ — RateLimits Component
// File: apps/web/app/(marketing)/developers/components/RateLimits.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.2
// Design Reference: Design Spec §7

export default function RateLimits() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Rate Limit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Features
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-semibold text-gray-900">PulsePro</div>
              <div className="text-sm text-gray-500">Commercial Farms</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              1,000 calls/day
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>7-day price forecast</li>
                <li>Real-time mandi prices</li>
                <li>Basic batch data</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-semibold text-gray-900">PulseEnterprise</div>
              <div className="text-sm text-gray-500">Integrators & Enterprise</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              10,000+ calls/day
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>30-day forward forecast</li>
                <li>FSSAI traceability API</li>
                <li>Webhook support</li>
                <li>Multi-farm access</li>
                <li>ERP integrations</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-semibold text-gray-900">Custom</div>
              <div className="text-sm text-gray-500">Enterprise Partners</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              Unlimited
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>Dedicated infrastructure</li>
                <li>Custom endpoints</li>
                <li>SLA guarantee</li>
                <li>Priority support</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
