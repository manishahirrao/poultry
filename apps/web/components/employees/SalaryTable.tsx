'use client';

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, DotsThree, CurrencyDollar } from '@phosphor-icons/react';
import useSWR from 'swr';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  name_hindi?: string;
  role: string;
  employment_type: string;
  base_salary_monthly?: number;
  daily_wage_rate?: number;
  is_active: boolean;
}

interface SalaryRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  days_present?: number;
  days_absent?: number;
  days_holiday?: number;
  overtime_hrs?: number;
  overtime_rate?: number;
  basic_salary: number;
  hra: number;
  conveyance: number;
  bonus_amount: number;
  overtime_amount: number;
  other_earnings: number;
  gross_earnings: number;
  pf_deduction: number;
  esi_deduction: number;
  advance_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  payment_status: 'pending' | 'processing' | 'paid' | 'on_hold';
  payment_date?: string;
  payment_mode?: string;
  payment_reference?: string;
  payment_notes?: string;
  farm_allocations?: Array<{ farm_id: string; allocation_pct: number }>;
  notes?: string;
  employees?: Employee;
}

interface SalaryTableProps {
  employees: Employee[];
  month: number;
  year: number;
  onProcessSalary: (employeeId: string) => void;
  language?: 'en' | 'hi';
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function SalaryTable({ employees, month, year, onProcessSalary, language = 'en' }: SalaryTableProps) {
  const isHindi = language === 'hi';
  
  const { data: salaryRecords, isLoading, error, mutate } = useSWR(
    `/api/salary?month=${month}&year=${year}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'processing':
        return <Clock size={12} />;
      case 'on_hold':
        return <XCircle size={12} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      paid: { en: 'Paid', hi: 'भुगतान हो गया' },
      pending: { en: 'Pending', hi: 'लंबित' },
      processing: { en: 'Processing', hi: 'प्रक्रिया में' },
      on_hold: { en: 'On Hold', hi: 'रोका हुआ' },
    };
    return labels[status as keyof typeof labels]?.[language] || status;
  };

  const getEmployeeSalaryRecord = (employeeId: string) => {
    if (!salaryRecords?.salaryRecords) return null;
    return salaryRecords.salaryRecords.find((record: SalaryRecord) => record.employee_id === employeeId);
  };

  const formatCurrencyDollar = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
        <div className="p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <p className="text-red-600">
          {isHindi ? 'वेतन रिकॉर्ड लोड करने में त्रुटि' : 'Error loading salary records'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
      <div className="p-6 border-b border-[#E3EDE7]">
        <h2 className="text-lg font-semibold text-gray-900">
          {isHindi ? 'वेतन रिकॉर्ड' : 'Salary Records'}
        </h2>
      </div>
      
      {employees.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500">
            {isHindi ? 'कोई कर्मचारी नहीं मिला' : 'No employees found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F4F7F5]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'कर्मचारी' : 'Employee'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'भूमिका' : 'Role'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'दिन उपस्थित' : 'Days Present'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'बुनियादी वेतन' : 'Basic Salary'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'भत्ते' : 'Allowances'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'कटौती' : 'Deductions'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'नेट वेतन' : 'Net Salary'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'स्थिति' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {isHindi ? 'कार्य' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EDE7]">
              {employees.map((employee) => {
                const salaryRecord = getEmployeeSalaryRecord(employee.id);
                const status = salaryRecord?.payment_status || 'pending';
                const allowances = (salaryRecord?.hra || 0) + (salaryRecord?.conveyance || 0) + (salaryRecord?.bonus_amount || 0) + (salaryRecord?.overtime_amount || 0) + (salaryRecord?.other_earnings || 0);
                const deductions = salaryRecord?.total_deductions || 0;
                const netSalary = salaryRecord?.net_salary || (employee.base_salary_monthly || (employee.daily_wage_rate || 0) * 30 || 0);

                return (
                  <tr key={employee.id} className="hover:bg-[#F4F7F5] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                        {employee.name_hindi && (
                          <div className="text-sm text-gray-500">{employee.name_hindi}</div>
                        )}
                        <div className="text-xs text-gray-400">{employee.employee_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {salaryRecord?.days_present || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrencyDollar(salaryRecord?.basic_salary || employee.base_salary_monthly || (employee.daily_wage_rate || 0) * 30 || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrencyDollar(allowances)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrencyDollar(deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrencyDollar(netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="relative group">
                        <button className="text-gray-600 hover:text-gray-900 p-1">
                          <DotsThree size={20} />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E3EDE7] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="py-1">
                            <button
                              onClick={() => onProcessSalary(employee.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F4F7F5]"
                            >
                              {isHindi ? 'वेतन प्रक्रिया करें' : 'Process Salary'}
                            </button>
                            {salaryRecord?.payment_status === 'pending' && (
                              <>
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F4F7F5]">
                                  {isHindi ? 'अग्रिम जोड़ें' : 'Add Advance'}
                                </button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F4F7F5]">
                                  {isHindi ? 'रोकें' : 'Put on Hold'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
