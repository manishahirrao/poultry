'use client';

interface ModelRegistryProps {
  models: any[];
}

export function ModelRegistry({ models }: ModelRegistryProps) {
  // Mock data if no models provided
  const mockModels = [
    {
      id: 'model-1',
      version: 'v2.3.1',
      promoted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'promoted',
      accuracy: 95.2,
      mape: 4.8,
      features: ['price_history', 'weather', 'feed_costs', 'disease_outbreaks'],
    },
    {
      id: 'model-2',
      version: 'v2.3.0',
      promoted_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      status: 'deprecated',
      accuracy: 94.8,
      mape: 5.1,
      features: ['price_history', 'weather', 'feed_costs'],
    },
    {
      id: 'model-3',
      version: 'v2.2.5',
      promoted_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      status: 'deprecated',
      accuracy: 93.5,
      mape: 5.8,
      features: ['price_history', 'weather'],
    },
  ];

  const modelData = models.length > 0 ? models : mockModels;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'promoted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            ✓ Promoted
          </span>
        );
      case 'deprecated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            Deprecated
          </span>
        );
      case 'staging':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Staging
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-neutral-900">Model Registry</h3>
        <button className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold">
          View All Models →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Version
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Accuracy
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                MAPE
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Features
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Promoted
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {modelData.map((model) => (
              <tr key={model.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-neutral-900">{model.version}</div>
                  <div className="text-xs text-neutral-500">{model.id}</div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(model.status)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-sm font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                    {model.accuracy.toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-sm font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                    {model.mape.toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {model.features.map((feature: string) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-600">
                  {formatDate(model.promoted_at)}
                </td>
                <td className="px-4 py-4">
                  <button className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
