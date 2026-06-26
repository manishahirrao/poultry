'use client';

import React, { useState, useEffect } from 'react';
import { 
  Link, 
  CheckCircle, 
  XCircle, 
  Clock, 
  WarningCircle, 
  Gear, 
  Plus,
  Download,
  ArrowClockwise,
  TestTube,
  Trash
} from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import { generateTallyXML, downloadTallyXML, type TallyPnLData } from '@/lib/tallyExporter';
import { 
  generateZohoAuthUrl, 
  type ZohoOrganization 
} from '@/lib/zohoIntegration';

interface CustomerIntegration {
  id: string;
  integration_type: 'tally' | 'zoho_books' | 'zoho_inventory' | 'sap' | 'oracle' | 'webhook';
  status: 'active' | 'inactive' | 'error' | 'pending';
  config: any;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'failed' | 'pending' | 'in_progress' | null;
  last_sync_error: string | null;
  last_test_connection_at: string | null;
  last_test_connection_status: 'success' | 'failed' | 'pending' | null;
  last_test_connection_error: string | null;
  tally_company_name?: string;
  zoho_organization_id?: string;
  zoho_organization_name?: string;
  webhook_url?: string;
  webhook_events?: string[];
}

interface IntegrationSyncLog {
  id: string;
  sync_type: string;
  sync_status: 'success' | 'failed' | 'pending' | 'in_progress';
  batch_id: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

interface WebhookDeliveryLog {
  id: string;
  event_type: string;
  http_status_code: number | null;
  response_time_ms: number | null;
  attempt_number: number;
  delivery_status: 'pending' | 'delivered' | 'failed' | 'retrying';
  error_message: string | null;
  created_at: string;
  delivered_at: string | null;
}

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<CustomerIntegration[]>([]);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [webhookDeliveryLogs, setWebhookDeliveryLogs] = useState<WebhookDeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<CustomerIntegration | null>(null);
  const [zohoOrganizations, setZohoOrganizations] = useState<ZohoOrganization[]>([]);
  const [showWebhookDeliveryModal, setShowWebhookDeliveryModal] = useState(false);
  const [selectedWebhookIntegration, setSelectedWebhookIntegration] = useState<CustomerIntegration | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchIntegrations();
    fetchSyncLogs();
  }, []);

  const fetchWebhookDeliveryLogs = async (integrationId: string) => {
    if (!supabase) {
      console.warn('[IntegrationsTab] Supabase not configured, skipping webhook delivery logs fetch');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('webhook_delivery_log')
        .select('*')
        .eq('customer_integration_id', integrationId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWebhookDeliveryLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch webhook delivery logs:', error);
    }
  };

  const handleViewWebhookDeliveries = (integration: CustomerIntegration) => {
    setSelectedWebhookIntegration(integration);
    setShowWebhookDeliveryModal(true);
    fetchWebhookDeliveryLogs(integration.id);
  };

  const fetchIntegrations = async () => {
    if (!supabase) {
      console.warn('[IntegrationsTab] Supabase not configured, skipping integrations fetch');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    if (!supabase) {
      console.warn('[IntegrationsTab] Supabase not configured, skipping sync logs fetch');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('integration_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch sync logs:', error);
    }
  };

  const handleTestConnection = async (integration: CustomerIntegration) => {
    setTestingConnection(integration.id);
    try {
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: integration.id,
          integrationType: integration.integration_type
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Connection test failed');
      }

      if (result.success && result.organizations) {
        setZohoOrganizations(result.organizations);
      }

      // Refresh integrations
      await fetchIntegrations();
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleConnectZoho = () => {
    const authUrl = generateZohoAuthUrl({
      clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || '',
      clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/settings/integrations/zoho/callback`,
      scope: 'ZohoBooks.fullaccess.all',
      accountsUrl: 'https://accounts.zoho.com'
    });
    window.location.href = authUrl;
  };

  const handleExportTally = async (integration: CustomerIntegration) => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }
    try {
      // Fetch all harvested batches for the customer
      const { data: batches, error } = await supabase
        .from('batches')
        .select('*')
        .eq('status', 'harvested')
        .order('doc_placement_date', { ascending: false });

      if (error) throw error;

      if (!batches || batches.length === 0) {
        alert('No harvested batches found to export');
        return;
      }

      // Convert batches to Tally P&L format
      const pnlDataArray: TallyPnLData[] = await Promise.all(
        batches.map(async (batch) => {
          // Fetch inventory movements for costs
          const { data: movements } = await supabase
            .from('inventory_movements')
            .select(`
              quantity,
              unit_cost,
              total_cost,
              movement_type,
              inventory_items!inner (
                category,
                name,
                avg_cost_per_unit
              )
            `)
            .eq('batch_id', batch.id);

          // Calculate costs by category
          const costs: any[] = [];
          const costCategories: Record<string, number> = {};

          movements?.forEach((movement: any) => {
            const category = movement.inventory_items.category;
            const cost = movement.total_cost || (Math.abs(movement.quantity) * (movement.unit_cost || movement.inventory_items.avg_cost_per_unit || 0));
            
            if (!costCategories[category]) {
              costCategories[category] = 0;
            }
            costCategories[category] += cost;
          });

          // Convert cost categories to Tally format
          Object.entries(costCategories).forEach(([category, amount]) => {
            costs.push({
              name: category.charAt(0).toUpperCase() + category.slice(1),
              amount,
              category: category as any
            });
          });

          // Add estimated costs (labor, electricity, overhead)
          const ageDays = batch.age_days || 0;
          costs.push({
            name: `Labor (₹800/day × ${ageDays} days)`,
            amount: 800 * ageDays,
            category: 'labor'
          });
          costs.push({
            name: `Electricity (₹200/day × ${ageDays} days)`,
            amount: 200 * ageDays,
            category: 'electricity'
          });
          costs.push({
            name: `Overhead (₹300/day × ${ageDays} days)`,
            amount: 300 * ageDays,
            category: 'overhead'
          });

          // Add DOC cost
          const docCost = (batch.doc_supplier_price || 42) * batch.doc_count;
          costs.push({
            name: `DOC cost (${batch.doc_count} × ₹${batch.doc_supplier_price || 42})`,
            amount: docCost,
            category: 'doc'
          });

          const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
          const revenue = (batch.birds_sold || 0) * (batch.actual_harvest_weight_kg || 0) * (batch.sale_price_per_kg || 0);
          const netProfit = revenue - totalCost;

          return {
            batchId: batch.id,
            batchName: batch.batch_id,
            docCount: batch.doc_count,
            docPlacementDate: batch.doc_placement_date,
            currentBirdCount: batch.current_bird_count,
            avgWeightKg: batch.avg_weight_kg,
            breed: batch.breed,
            ageDays: batch.age_days,
            status: batch.status,
            actualHarvestWeightKg: batch.actual_harvest_weight_kg,
            birdsSold: batch.birds_sold,
            salePricePerKg: batch.sale_price_per_kg,
            revenue,
            costs,
            totalCost,
            netProfit,
            isProjected: false
          };
        })
      );

      // Generate Tally XML for all batches
      const xml = generateTallyXML(pnlDataArray[0], {
        companyName: integration.tally_company_name || 'FlockIQ Farm'
      });

      // Download the XML file
      downloadTallyXML(xml, `tally_export_${new Date().toISOString().split('T')[0]}.xml`);

    } catch (error) {
      console.error('Tally export failed:', error);
      alert('Failed to export Tally XML. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle size={20} weight="fill" className="text-green-600" />;
      case 'error':
      case 'failed':
        return <XCircle size={20} weight="fill" className="text-red-600" />;
      case 'pending':
      case 'in_progress':
        return <Clock size={20} weight="fill" className="text-amber-600" />;
      default:
        return <WarningCircle size={20} weight="fill" className="text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getIntegrationName = (type: string) => {
    const names: Record<string, string> = {
      tally: 'Tally Prime',
      zoho_books: 'Zoho Books',
      zoho_inventory: 'Zoho Inventory',
      sap: 'SAP ERP',
      oracle: 'Oracle ERP',
      webhook: 'Custom Webhook'
    };
    return names[type] || type;
  };

  const getIntegrationIcon = (type: string) => {
    // Return appropriate icon based on integration type
    return <Link size={24} weight="bold" />;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 rounded w-1/3" />
        <div className="h-32 bg-neutral-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Integrations</h2>
          <p className="text-neutral-600 mt-1">
            Manage your ERP and accounting system integrations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} weight="bold" />
          Add Integration
        </button>
      </div>

      {/* Active Integrations */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900">Active Integrations</h3>
        </div>
        
        {integrations.length === 0 ? (
          <div className="p-12 text-center">
            <Link size={48} weight="thin" className="text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">No integrations configured yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first integration
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-100 rounded-lg">
                      {getIntegrationIcon(integration.integration_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-neutral-900">
                          {getIntegrationName(integration.integration_type)}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {integration.tally_company_name && (
                        <p className="text-sm text-neutral-600 mt-1">
                          Company: {integration.tally_company_name}
                        </p>
                      )}
                      
                      {integration.zoho_organization_name && (
                        <p className="text-sm text-neutral-600 mt-1">
                          Organization: {integration.zoho_organization_name}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.last_sync_status || 'pending')}
                          <span className="text-neutral-600">
                            Last sync: {integration.last_sync_at 
                              ? new Date(integration.last_sync_at).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </div>
                        {integration.last_sync_error && (
                          <span className="text-red-600">{integration.last_sync_error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(integration)}
                      disabled={testingConnection === integration.id}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Test Connection"
                    >
                      <TestTube size={20} weight="bold" />
                    </button>
                    {integration.integration_type === 'tally' && (
                      <button
                        onClick={() => handleExportTally(integration)}
                        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Export to Tally"
                      >
                        <Download size={20} weight="bold" />
                      </button>
                    )}
                    <button
                      onClick={() => {/* Sync now */}}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Sync Now"
                    >
                      <ArrowClockwise size={20} weight="bold" />
                    </button>
                    <button
                      onClick={() => setSelectedIntegration(integration)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Settings"
                    >
                      <Gear size={20} weight="bold" />
                    </button>
                    {integration.integration_type === 'webhook' && (
                      <button
                        onClick={() => handleViewWebhookDeliveries(integration)}
                        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View Delivery History"
                      >
                        <Clock size={20} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Logs */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900">Recent Sync Activity</h3>
        </div>
        
        {syncLogs.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">
            No sync activity yet
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.sync_status)}
                  <div>
                    <p className="font-medium text-neutral-900">{log.sync_type}</p>
                    <p className="text-sm text-neutral-600">
                      {new Date(log.started_at).toLocaleString()}
                      {log.duration_ms && ` · ${log.duration_ms}ms`}
                    </p>
                  </div>
                </div>
                {log.error_message && (
                  <span className="text-sm text-red-600">{log.error_message}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Add Integration</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleConnectZoho}
                className="w-full p-4 border border-neutral-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-neutral-900">Zoho Books</div>
                <div className="text-sm text-neutral-600 mt-1">
                  Sync invoices, bills, and inventory
                </div>
              </button>
              
              <button
                onClick={() => {/* Tally setup */}}
                className="w-full p-4 border border-neutral-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-neutral-900">Tally Prime</div>
                <div className="text-sm text-neutral-600 mt-1">
                  Export P&L data as XML
                </div>
              </button>
              
              <button
                onClick={() => {/* Webhook setup */}}
                className="w-full p-4 border border-neutral-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold text-neutral-900">Custom Webhook</div>
                <div className="text-sm text-neutral-600 mt-1">
                  Send data to your custom endpoint
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-6 w-full px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Webhook Delivery History Modal */}
      {showWebhookDeliveryModal && selectedWebhookIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neutral-900">
                Webhook Delivery History
              </h3>
              <button
                onClick={() => {
                  setShowWebhookDeliveryModal(false);
                  setSelectedWebhookIntegration(null);
                  setWebhookDeliveryLogs([]);
                }}
                className="text-neutral-600 hover:text-neutral-900"
              >
                <XCircle size={24} weight="bold" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm font-medium text-neutral-900">
                Webhook URL: {selectedWebhookIntegration.webhook_url}
              </div>
              <div className="text-sm text-neutral-600 mt-1">
                Events: {selectedWebhookIntegration.webhook_events?.join(', ')}
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {webhookDeliveryLogs.length === 0 ? (
                <div className="text-center py-12 text-neutral-600">
                  No delivery history yet
                </div>
              ) : (
                <div className="space-y-2">
                  {webhookDeliveryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(log.delivery_status)}
                            <span className="font-medium text-neutral-900">
                              {log.event_type}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.delivery_status)}`}>
                              {log.delivery_status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-neutral-600">Attempt:</span>
                              <span className="ml-2 font-medium text-neutral-900">
                                {log.attempt_number} / {3}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-600">Status Code:</span>
                              <span className="ml-2 font-medium text-neutral-900">
                                {log.http_status_code || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-600">Response Time:</span>
                              <span className="ml-2 font-medium text-neutral-900">
                                {log.response_time_ms ? `${log.response_time_ms}ms` : 'N/A'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-neutral-600 mt-2">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                          
                          {log.error_message && (
                            <div className="mt-2 text-sm text-red-600">
                              {log.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
