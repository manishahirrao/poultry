'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUp, ArrowDown, CaretDown, Download, Eye } from '@phosphor-icons/react';
import { CustomerTableSkeleton } from '@/components/dashboard/skeletons';

interface CustomerTableProps {
  customers: any[];
  total: number;
  currentPage: number;
  filters: {
    segment?: string;
    status?: string;
    district?: string;
    search?: string;
    page: number;
    pageSize: number;
  };
}

export function CustomerTable({ customers, total, currentPage, filters }: CustomerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSlidersHorizontalChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/dashboard/customers?${params.toString()}`);
  };

  const handlePhoneReveal = (customerId: string, phone: string) => {
    // Log to admin_audit_log
    fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'phone_reveal',
        target_customer_id: customerId,
      }),
    });

    setRevealedPhones(prev => new Set([...prev, customerId]));
  };

  const maskPhone = (phone: string) => {
    return `+91-XXXXX${phone.slice(-5)}`;
  };

  const getSegmentBadge = (segment: string) => {
    const colors: Record<string, string> = {
      S1: 'bg-neutral-100 text-neutral-700',
      S2: 'bg-blue-100 text-blue-700',
      S3: 'bg-purple-100 text-purple-700',
      S4: 'bg-green-100 text-green-700',
      S5: 'bg-amber-100 text-amber-700',
      S6: 'bg-red-100 text-red-700',
      admin: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colors[segment] || colors.S1}`}>
        {segment}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Trial
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            Expired
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

  const totalPages = Math.ceil(total / filters.pageSize);

  const handleCSVExport = () => {
    const headers = ['Name', 'Phone', 'Segment', 'Plan', 'Status', 'District', 'Created At'];
    const rows = customers.map((c: any) => [
      c.name || '—',
      c.phone,
      c.segment,
      c.plan,
      c.status,
      c.district,
      new Date(c.created_at).toLocaleDateString('en-IN'),
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlockIQ-customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!customers || customers.length === 0) {
    return <CustomerTableSkeleton rows={10} />;
  }

  return (
    <div className="space-y-4">
      {/* SlidersHorizontals */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-neutral-700">Segment:</label>
            <select
              value={filters.segment || ''}
              onChange={(e) => handleSlidersHorizontalChange('segment', e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            >
              <option value="">All</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
              <option value="S4">S4</option>
              <option value="S5">S5</option>
              <option value="S6">S6</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-neutral-700">Status:</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleSlidersHorizontalChange('status', e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-neutral-700">District:</label>
            <select
              value={filters.district || ''}
              onChange={(e) => handleSlidersHorizontalChange('district', e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            >
              <option value="">All</option>
              <option value="gorakhpur">Gorakhpur</option>
              <option value="deoria">Deoria</option>
              <option value="kushinagar">Kushinagar</option>
              <option value="basti">Basti</option>
              <option value="maharajganj">Maharajganj</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-neutral-700">MagnifyingGlass:</label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleSlidersHorizontalChange('search', e.target.value)}
              placeholder="Phone number..."
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            />
          </div>

          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors ml-auto"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('segment')}
                >
                  <div className="flex items-center gap-1">
                    Segment
                    {sortField === 'segment' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('plan')}
                >
                  <div className="flex items-center gap-1">
                    Plan
                    {sortField === 'plan' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  District
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {customers.map((customer: any) => (
                <>
                  <tr
                    key={customer.id}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === customer.id ? null : customer.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-neutral-900">{customer.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {revealedPhones.has(customer.id) ? (
                        <span className="text-sm text-neutral-900">{customer.phone}</span>
                      ) : (
                        <span
                          className="text-sm text-neutral-600 hover:text-neutral-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhoneReveal(customer.id, customer.phone);
                          }}
                        >
                          {maskPhone(customer.phone)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getSegmentBadge(customer.segment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">{customer.plan}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900 capitalize">{customer.district}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-600">
                        {new Date(customer.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRow(expandedRow === customer.id ? null : customer.id);
                        }}
                        className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold"
                      >
                        {expandedRow === customer.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === customer.id && (
                    <tr className="bg-neutral-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Subscription Details</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Plan:</span>
                                <span className="font-semibold text-neutral-900">{customer.plan}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Expires:</span>
                                <span className="font-semibold text-neutral-900">
                                  {customer.subscription_expires_at
                                    ? new Date(customer.subscription_expires_at).toLocaleDateString('en-IN')
                                    : '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">30-Day Usage</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Predictions Viewed:</span>
                                <span className="font-semibold text-neutral-900">156</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Alerts Triggered:</span>
                                <span className="font-semibold text-neutral-900">12</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Downloads:</span>
                                <span className="font-semibold text-neutral-900">8</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">WhatsApp Delivery</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Sent:</span>
                                <span className="font-semibold text-neutral-900">24</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Delivered:</span>
                                <span className="font-semibold text-green-600">23</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Failed:</span>
                                <span className="font-semibold text-red-600">1</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Showing {(currentPage - 1) * filters.pageSize + 1} to {Math.min(currentPage * filters.pageSize, total)} of {total} customers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', (currentPage - 1).toString());
                router.replace(`/dashboard/customers?${params.toString()}`);
              }}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', (currentPage + 1).toString());
                router.replace(`/dashboard/customers?${params.toString()}`);
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
