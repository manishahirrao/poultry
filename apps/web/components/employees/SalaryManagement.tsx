'use client';

import { useState } from 'react';
import { Calendar, FileText, CheckCircle, Clock, Download, Play } from '@phosphor-icons/react';
import { SalaryTable } from './SalaryTable';
import { ProcessSalaryModal } from './ProcessSalaryModal';
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
  assigned_farm_ids?: string[];
}

interface SalaryManagementProps {
  employees: Employee[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function SalaryManagement({ employees }: SalaryManagementProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const months = [
    { en: 'January', hi: 'जनवरी' },
    { en: 'February', hi: 'फरवरी' },
    { en: 'March', hi: 'मार्च' },
    { en: 'April', hi: 'अप्रैल' },
    { en: 'May', hi: 'मई' },
    { en: 'June', hi: 'जून' },
    { en: 'July', hi: 'जुलाई' },
    { en: 'August', hi: 'अगस्त' },
    { en: 'September', hi: 'सितंबर' },
    { en: 'October', hi: 'अक्टूबर' },
    { en: 'November', hi: 'नवंबर' },
    { en: 'December', hi: 'दिसंबर' },
  ];

  const { data: salaryRecords, mutate } = useSWR(
    `/api/salary?month=${selectedMonth}&year=${selectedYear}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: leaveEntries } = useSWR(
    `/api/payroll/leave-entries`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const getMonthLabel = (monthIndex: number) => {
    return language === 'en' ? months[monthIndex - 1].en : months[monthIndex - 1].hi;
  };

  const formatCurrencyDollar = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate summary stats
  const records = salaryRecords?.salaryRecords || [];
  const grossPayroll = records.reduce((sum: number, r: any) => sum + (r.gross_earnings || 0), 0);
  const totalDeductions = records.reduce((sum: number, r: any) => sum + (r.total_deductions || 0), 0);
  const netPayable = records.reduce((sum: number, r: any) => sum + (r.net_salary || 0), 0);
  const paidCount = records.filter((r: any) => r.payment_status === 'paid').length;
  const pendingCount = records.filter((r: any) => r.payment_status === 'pending').length;

  const handleProcessSalary = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleModalSuccess = () => {
    mutate();
  };

  const handleProcessAllPending = async () => {
    const pendingEmployees = employees.filter(emp => {
      const record = records.find((r: any) => r.employee_id === emp.id);
      return !record || record.payment_status === 'pending';
    });

    if (pendingEmployees.length === 0) {
      alert(language === 'hi' ? 'कोई लंबित वेतन नहीं' : 'No pending salaries');
      return;
    }

    if (confirm(language === 'hi' 
      ? `${pendingEmployees.length} कर्मचारियों के लिए वेतन रिकॉर्ड बनाएं?` 
      : `Create salary records for ${pendingEmployees.length} employees?`)) {
      // Process all pending employees
      for (const employee of pendingEmployees) {
        try {
          // Calculate leave deduction for this employee
          const employeeLeaveEntries = (leaveEntries || []).filter((le: any) => 
            le.employee_id === employee.id && 
            le.status === 'approved' &&
            new Date(le.from_date).getMonth() + 1 === selectedMonth &&
            new Date(le.from_date).getFullYear() === selectedYear
          );
          
          const unpaidLeaveDays = employeeLeaveEntries
            .filter((le: any) => le.leave_type === 'unpaid')
            .reduce((sum: number, le: any) => sum + le.days_count, 0);
          
          const dailyRate = (employee.base_salary_monthly || (employee.daily_wage_rate || 0) * 30 || 0) / 30;
          const leaveDeduction = unpaidLeaveDays * dailyRate;

          await fetch('/api/salary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: employee.id,
              month: selectedMonth,
              year: selectedYear,
              basicSalary: employee.base_salary_monthly || (employee.daily_wage_rate || 0) * 30 || 0,
              daysPresent: 30 - unpaidLeaveDays,
              daysAbsent: unpaidLeaveDays,
              daysHoliday: 0,
              overtimeHrs: 0,
              overtimeRate: 0,
              hra: 0,
              conveyance: 0,
              bonusAmount: 0,
              overtimeAmount: 0,
              otherEarnings: 0,
              pfDeduction: 0,
              esiDeduction: 0,
              advanceDeduction: 0,
              otherDeductions: leaveDeduction,
              paymentStatus: 'pending',
              farmAllocations: employee.assigned_farm_ids?.map(farmId => ({
                farm_id: farmId,
                allocation_pct: 100 / (employee.assigned_farm_ids?.length || 1)
              })) || [],
            }),
          });
        } catch (error) {
          console.error('Error creating salary record:', error);
        }
      }
      mutate();
    }
  };

  const handleDownloadSalarySheet = () => {
    // Create CSV content
    const headers = ['Employee Code', 'Name', 'Role', 'Days Present', 'Basic Salary', 'HRA', 'Conveyance', 'Bonus', 'Overtime', 'Other Earnings', 'Gross Earnings', 'PF Deduction', 'ESI Deduction', 'Advance Deduction', 'Other Deductions', 'Total Deductions', 'Net Salary', 'Payment Status', 'Payment Date'];
    const rows = records.map((r: any) => [
      r.employees?.employee_code || '',
      r.employees?.full_name || '',
      r.employees?.role || '',
      r.days_present || '',
      r.basic_salary || 0,
      r.hra || 0,
      r.conveyance || 0,
      r.bonus_amount || 0,
      r.overtime_amount || 0,
      r.other_earnings || 0,
      r.gross_earnings || 0,
      r.pf_deduction || 0,
      r.esi_deduction || 0,
      r.advance_deduction || 0,
      r.other_deductions || 0,
      r.total_deductions || 0,
      r.net_salary || 0,
      r.payment_status || '',
      r.payment_date || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_sheet_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleMarkAllAsPaid = async () => {
    const pendingRecords = records.filter((r: any) => r.payment_status === 'pending' || r.payment_status === 'processing');
    
    if (pendingRecords.length === 0) {
      alert(language === 'hi' ? 'कोई लंबित वेतन नहीं' : 'No pending salaries to mark as paid');
      return;
    }

    if (confirm(language === 'hi' 
      ? `${pendingRecords.length} वेतन रिकॉर्ड को भुगतान के रूप में चिह्नित करें?` 
      : `Mark ${pendingRecords.length} salary records as paid?`)) {
      for (const record of pendingRecords) {
        try {
          await fetch(`/api/salary/${record.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentStatus: 'paid',
              paymentDate: new Date().toISOString().split('T')[0],
            }),
          });
        } catch (error) {
          console.error('Error marking as paid:', error);
        }
      }
      
      // Trigger GC labour cost sync for affected farms (GAP-008)
      const farmIds = new Set<string>();
      pendingRecords.forEach((record: any) => {
        if (record.farm_allocations) {
          record.farm_allocations.forEach((alloc: any) => {
            farmIds.add(alloc.farm_id);
          });
        }
      });
      
      // Calculate total labour cost per farm and update GC
      for (const farmId of farmIds) {
        try {
          // Calculate total labour cost for this farm from salary records
          const farmLabourCost = pendingRecords
            .filter((r: any) => r.farm_allocations?.some((alloc: any) => alloc.farm_id === farmId))
            .reduce((sum: number, r: any) => {
              const allocation = r.farm_allocations?.find((alloc: any) => alloc.farm_id === farmId);
              const allocationPct = allocation?.allocation_pct || 100;
              return sum + (r.net_salary * (allocationPct / 100));
            }, 0);
          
          // Update GC labour cost for this farm
          await fetch(`/api/farms/${farmId}/gc`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              labourCostTotal: farmLabourCost,
            }),
          });
        } catch (error) {
          console.error('Error syncing GC labour cost:', error);
        }
      }
      
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {language === 'en' ? month.en : month.hi}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
            >
              {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-sm ${language === 'en' ? 'bg-[#1A5C34] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-lg text-sm ${language === 'hi' ? 'bg-[#1A5C34] text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'hi' ? 'कुल वेतन' : 'Gross Payroll'}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyDollar(grossPayroll)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <FileText size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'hi' ? 'कुल कटौती' : 'Total Deductions'}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyDollar(totalDeductions)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'hi' ? 'नेट देय' : 'Net Payable'}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyDollar(netPayable)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'hi' ? 'भुगतान हो गया' : 'Paid'}</p>
              <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'hi' ? 'लंबित' : 'Pending'}</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleProcessAllPending}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#1A5C34]/90 transition-colors"
        >
          <Play size={20} />
          {language === 'hi' ? 'सभी लंबित प्रक्रिया करें' : 'Process All Pending'}
        </button>
        <button
          onClick={handleDownloadSalarySheet}
          className="flex items-center gap-2 px-4 py-2 bg-[#3DAE72] text-white rounded-lg hover:bg-[#3DAE72]/90 transition-colors"
        >
          <Download size={20} />
          {language === 'hi' ? 'वेतन शीट डाउनलोड करें' : 'Download Salary Sheet'}
        </button>
        <button
          onClick={handleMarkAllAsPaid}
          className="flex items-center gap-2 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-[#F4F7F5] transition-colors"
        >
          <CheckCircle size={20} />
          {language === 'hi' ? 'सभी को भुगतान के रूप में चिह्नित करें' : 'Mark All as Paid'}
        </button>
      </div>

      {/* Salary Table */}
      <SalaryTable
        employees={employees}
        month={selectedMonth}
        year={selectedYear}
        onProcessSalary={handleProcessSalary}
        language={language}
      />

      {/* Process Salary Modal */}
      {selectedEmployee && (
        <ProcessSalaryModal
          employee={selectedEmployee}
          month={selectedMonth}
          year={selectedYear}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          language={language}
        />
      )}
    </div>
  );
}
