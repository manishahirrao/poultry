'use client';

/**
 * FlockIQ - Contract Compliance Card
 * ISSUE-021: Missing Metrics Implementation
 * 
 * This component displays contract compliance metrics:
 * - Overall compliance score
 * - Individual metric compliance (weight, FCR, mortality, etc.)
 * - Penalties and bonuses
 * - Compliance status tracking
 */

import React from 'react';
import { FileText, CheckCircle, Warning, XCircle, TrendUp, TrendDown } from '@phosphor-icons/react';

interface ContractComplianceCardProps {
  complianceData?: {
    contractName: string;
    counterpartyName: string;
    overallComplianceScore: number;
    complianceStatus: 'pending' | 'compliant' | 'non_compliant' | 'partially_compliant';
    weightCompliancePct?: number;
    fcrCompliancePct?: number;
    mortalityCompliancePct?: number;
    dressingYieldCompliancePct?: number;
    condemnationCompliancePct?: number;
    uniformityCompliancePct?: number;
    penaltyAmount: number;
    bonusAmount: number;
    netAdjustment: number;
    evaluationPeriod: {
      startDate: string;
      endDate: string;
    };
  };
}

export function ContractComplianceCard({ complianceData }: ContractComplianceCardProps) {
  if (!complianceData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Compliance</h3>
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No contract compliance data available
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partially_compliant':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'non_compliant':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4" />;
      case 'partially_compliant':
        return <Warning className="w-4 h-4" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contract Compliance</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <FileText className="w-4 h-4 mr-1" />
          <span>Performance vs contract terms</span>
        </div>
      </div>

      {/* Contract Info */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-900">{complianceData.contractName}</p>
            <p className="text-xs text-gray-500">{complianceData.counterpartyName}</p>
          </div>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(
              complianceData.complianceStatus
            )}`}
          >
            {getStatusIcon(complianceData.complianceStatus)}
            <span className="text-sm font-medium capitalize">
              {complianceData.complianceStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Evaluation: {new Date(complianceData.evaluationPeriod.startDate).toLocaleDateString()} -{' '}
          {new Date(complianceData.evaluationPeriod.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Overall Compliance Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(complianceData.overallComplianceScore)}`}>
            {complianceData.overallComplianceScore.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Individual Metric Compliance */}
      {(complianceData.weightCompliancePct ||
        complianceData.fcrCompliancePct ||
        complianceData.mortalityCompliancePct ||
        complianceData.dressingYieldCompliancePct ||
        complianceData.condemnationCompliancePct ||
        complianceData.uniformityCompliancePct) && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Metric Compliance</h4>
          <div className="space-y-2">
            {complianceData.weightCompliancePct !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Weight</span>
                <span className={`font-medium ${getScoreColor(complianceData.weightCompliancePct)}`}>
                  {complianceData.weightCompliancePct.toFixed(1)}%
                </span>
              </div>
            )}
            {complianceData.fcrCompliancePct !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">FCR</span>
                <span className={`font-medium ${getScoreColor(complianceData.fcrCompliancePct)}`}>
                  {complianceData.fcrCompliancePct.toFixed(1)}%
                </span>
              </div>
            )}
            {complianceData.mortalityCompliancePct !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mortality</span>
                <span className={`font-medium ${getScoreColor(complianceData.mortalityCompliancePct)}`}>
                  {complianceData.mortalityCompliancePct.toFixed(1)}%
                </span>
              </div>
            )}
            {complianceData.dressingYieldCompliancePct !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Dressing Yield</span>
                <span className={`font-medium ${getScoreColor(complianceData.dressingYieldCompliancePct)}`}>
                  {complianceData.dressingYieldCompliancePct.toFixed(1)}%
                </span>
              </div>
            )}
            {complianceData.condemnationCompliancePct !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Condemnation Rate</span>
                <span className={`font-medium ${getScoreColor(complianceData.condemnationCompliancePct)}`}>
                  {complianceData.condemnationCompliancePct.toFixed(1)}%
                </span>
              </div>
            )}
            {complianceData.uniformityCompliancePct !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uniformity</span>
                <span className={`font-medium ${getScoreColor(complianceData.uniformityCompliancePct)}`}>
                  {complianceData.uniformityCompliancePct.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Impact */}
      {(complianceData.penaltyAmount > 0 || complianceData.bonusAmount > 0) && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Financial Impact</h4>
          <div className="space-y-2">
            {complianceData.penaltyAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <TrendDown className="w-4 h-4 text-red-600" />
                  <span className="text-gray-600">Penalty</span>
                </div>
                <span className="font-medium text-red-600">
                  -₹{complianceData.penaltyAmount.toLocaleString()}
                </span>
              </div>
            )}
            {complianceData.bonusAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <TrendUp className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Bonus</span>
                </div>
                <span className="font-medium text-green-600">
                  +₹{complianceData.bonusAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Net Adjustment</span>
              <span
                className={`text-lg font-bold ${
                  complianceData.netAdjustment >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {complianceData.netAdjustment >= 0 ? '+' : ''}
                ₹{complianceData.netAdjustment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
