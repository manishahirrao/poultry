'use client';

/**
 * FlockIQ - Accounts Receivable and Payable Card
 * ISSUE-021: Missing Metrics Implementation
 * 
 * This component displays accounts receivable and payable metrics:
 * - Total Receivables (money owed to farmer)
 * - Total Payables (money owed by farmer)
 * - Outstanding amounts
 * - Payment status tracking
 */

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Calendar, Money, Clock, CheckCircle } from '@phosphor-icons/react';

interface AccountsReceivablePayableCardProps {
  receivablesData?: {
    totalReceivables: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueAmount: number;
    pendingCount: number;
    overdueCount: number;
  };
  payablesData?: {
    totalPayables: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueAmount: number;
    pendingCount: number;
    overdueCount: number;
  };
}

export function AccountsReceivablePayableCard({
  receivablesData,
  payablesData,
}: AccountsReceivablePayableCardProps) {
  if (!receivablesData && !payablesData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Receivable & Payable</h3>
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Money className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No accounts receivable or payable data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Accounts Receivable & Payable</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <Money className="w-4 h-4 mr-1" />
          <span>Financial tracking</span>
        </div>
      </div>

      {/* Accounts Receivable */}
      {receivablesData && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownLeft className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-medium text-gray-900">Accounts Receivable</h4>
            <span className="text-xs text-gray-500">(Money owed to you)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Receivables</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{receivablesData.totalReceivables.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Outstanding</p>
              <p className="text-xl font-bold text-green-600">
                ₹{receivablesData.totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-gray-600">Paid: ₹{receivablesData.totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span className="text-gray-600">Pending: {receivablesData.pendingCount}</span>
            </div>
            {receivablesData.overdueCount > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-red-600" />
                <span className="text-red-600">Overdue: {receivablesData.overdueCount}</span>
              </div>
            )}
          </div>

          {receivablesData.overdueAmount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-red-600 font-medium">
                Overdue amount: ₹{receivablesData.overdueAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Accounts Payable */}
      {payablesData && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-medium text-gray-900">Accounts Payable</h4>
            <span className="text-xs text-gray-500">(Money you owe)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Payables</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{payablesData.totalPayables.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Outstanding</p>
              <p className="text-xl font-bold text-red-600">
                ₹{payablesData.totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-gray-600">Paid: ₹{payablesData.totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span className="text-gray-600">Pending: {payablesData.pendingCount}</span>
            </div>
            {payablesData.overdueCount > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-red-600" />
                <span className="text-red-600">Overdue: {payablesData.overdueCount}</span>
              </div>
            )}
          </div>

          {payablesData.overdueAmount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-red-600 font-medium">
                Overdue amount: ₹{payablesData.overdueAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Net Position */}
      {receivablesData && payablesData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Net Cash Position</p>
            <p className={`text-lg font-bold ${
              (receivablesData.totalOutstanding - payablesData.totalOutstanding) >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              ₹{(receivablesData.totalOutstanding - payablesData.totalOutstanding).toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Receivables - Payables
          </p>
        </div>
      )}
    </div>
  );
}
