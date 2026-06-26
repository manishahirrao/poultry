'use client';

import { useState, useEffect } from 'react';
import { Copy, Key, ArrowClockwise, Eye, EyeSlash } from '@phosphor-icons/react';

interface APIKeyManagerProps {
  customerId: string;
}

interface APIKeyData {
  hasKey: boolean;
  key: string | null;
  metadata: {
    created_at: string;
    expires_at: string;
    last_used: string | null;
    usage_count: number;
  } | null;
}

export function APIKeyManager({ customerId }: APIKeyManagerProps) {
  const [apiKeyData, setApiKeyData] = useState<APIKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, [customerId]);

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/dashboard/api-keys');
      const data = await response.json();
      setApiKeyData(data);
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async () => {
    if (!confirm('Are you sure you want to rotate your API key? This will invalidate your current key immediately.')) {
      return;
    }

    setRotating(true);
    try {
      const response = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setNewKey(data.key);
        setShowKey(true);
        await fetchApiKey();
      }
    } catch (error) {
      console.error('Error rotating API key:', error);
    } finally {
      setRotating(false);
    }
  };

  const handleCopyKey = () => {
    const keyToCopy = newKey || (apiKeyData?.hasKey ? apiKeyData.key : '');
    if (keyToCopy) {
      navigator.clipboard.writeText(keyToCopy);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="h-8 bg-neutral-200 rounded animate-pulse w-48 mb-4" />
        <div className="h-12 bg-neutral-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-brandGreen100 flex items-center justify-center">
          <Key size={20} className="text-brandGreen700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">API Key Management</h3>
          <p className="text-xs text-neutral-500">Manage your API access credentials</p>
        </div>
      </div>

      {!apiKeyData?.hasKey ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>No API key generated yet.</strong> Generate your first API key to start using the FlockIQ API.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-neutral-700 mb-2 block">
              {newKey ? 'New API Key (copy now - won\'t be shown again)' : 'Current API Key'}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <code className="block w-full px-4 py-3 bg-neutral-100 rounded-lg text-sm text-neutral-900 font-mono pr-12">
                  {showKey ? (newKey || apiKeyData?.key) : '••••••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                onClick={handleCopyKey}
                className="px-4 py-3 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>

          {apiKeyData?.metadata && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Created:</span>{' '}
                <span className="text-neutral-900">
                  {new Date(apiKeyData.metadata.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Expires:</span>{' '}
                <span className="text-neutral-900">
                  {new Date(apiKeyData.metadata.expires_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Last Used:</span>{' '}
                <span className="text-neutral-900">
                  {apiKeyData.metadata.last_used 
                    ? new Date(apiKeyData.metadata.last_used).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Usage Count:</span>{' '}
                <span className="text-neutral-900">{apiKeyData.metadata.usage_count || 0}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          Rate limit: 1000 requests per day • Resets at midnight IST
        </div>
        <button
          onClick={handleRotateKey}
          disabled={rotating}
          className="px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {rotating ? (
            <>
              <ArrowClockwise size={16} className="animate-spin" />
              Rotating...
            </>
          ) : (
            <>
              <ArrowClockwise size={16} />
              {apiKeyData?.hasKey ? 'Rotate API Key' : 'Generate API Key'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
