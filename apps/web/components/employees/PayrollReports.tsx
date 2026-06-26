'use client';

import { useState } from 'react';
import { FileText, Download, Printer, Calendar, User, ChartBar } from '@phosphor-icons/react';
import useSWR from 'swr';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  name_hindi?: string;
  role: string;
}

interface PayrollReportsProps {
  employees: Employee[];
  integratorId: string;
}

interface SalaryRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
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
  payment_status: string;
  payment_date?: string;
  employees?: {
    employee_code: string;
    full_name: string;
    role: string;
  };
}

interface ExpenseRecord {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  description?: string;
  payment_status: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function PayrollReports({ employees, integratorId }: PayrollReportsProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeReport, setActiveReport] = useState<'salary' | 'ledger' | 'expense' | 'department'>('salary');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

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

  const { data: salaryRecords } = useSWR<SalaryRecord[]>(
    `/api/salary?month=${selectedMonth}&year=${selectedYear}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: expenses } = useSWR<ExpenseRecord[]>(
    `/api/expenses?month=${selectedMonth}&year=${selectedYear}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const formatCurrencyDollar = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (activeReport === 'salary') {
      const headers = ['Employee Code', 'Name', 'Role', 'Basic', 'HRA', 'Conveyance', 'Bonus', 'Overtime', 'Other Earnings', 'Gross', 'PF', 'ESI', 'Advance', 'Other Deductions', 'Total Deductions', 'Net Salary', 'Status', 'Payment Date'];
      const rows = (salaryRecords || []).map(r => [
        r.employees?.employee_code || '',
        r.employees?.full_name || '',
        r.employees?.role || '',
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
      csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `salary_register_${selectedMonth}_${selectedYear}.csv`;
    } else if (activeReport === 'expense') {
      const headers = ['Date', 'Category', 'Amount', 'Description', 'Status'];
      const rows = (expenses || []).map(e => [
        formatDate(e.expense_date),
        e.category,
        e.amount,
        e.description || '',
        e.payment_status,
      ]);
      csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `expense_register_${selectedMonth}_${selectedYear}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'salary', label: 'Salary Register / वेतन रजिस्टर', icon: FileText },
    { id: 'ledger', label: 'Employee Ledger / कर्मचारी खाता', icon: User },
    { id: 'expense', label: 'Expense Register / व्यय रजिस्टर', icon: ChartBar },
    { id: 'department', label: 'Department Summary / विभाग सारांश', icon: ChartBar },
  ];

  const filteredSalaryRecords = selectedEmployee
    ? (salaryRecords || []).filter(r => r.employee_id === selectedEmployee)
    : salaryRecords;

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
            {activeReport === 'ledger' && (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            )}
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
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-[#F4F7F5] transition-colors"
            >
              <Download size={20} />
              {language === 'hi' ? 'CSV निर्यात' : 'Export CSV'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-[#F4F7F5] transition-colors"
            >
              <Printer size={20} />
              {language === 'hi' ? 'प्रिंट' : 'Print'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <div className="flex gap-4 border-b border-[#E3EDE7] mb-6">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeReport === tab.id
                  ? 'border-[#1A5C34] text-[#1A5C34]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Salary Register */}
        {activeReport === 'salary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'कुल कर्मचारी' : 'Total Employees'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">{filteredSalaryRecords?.length || 0}</p>
              </div>
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'कुल सकल' : 'Total Gross'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">
                  {formatCurrencyDollar((filteredSalaryRecords || []).reduce((sum, r) => sum + (r.gross_earnings || 0), 0))}
                </p>
              </div>
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'कुल कटौती' : 'Total Deductions'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">
                  {formatCurrencyDollar((filteredSalaryRecords || []).reduce((sum, r) => sum + (r.total_deductions || 0), 0))}
                </p>
              </div>
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'कुल नेट' : 'Total Net'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">
                  {formatCurrencyDollar((filteredSalaryRecords || []).reduce((sum, r) => sum + (r.net_salary || 0), 0))}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'कर्मचारी' : 'Employee'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'मूल' : 'Basic'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'HRA' : 'HRA'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'भत्ता' : 'Allowances'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'सकल' : 'Gross'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'कटौती' : 'Deductions'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'नेट' : 'Net'}</th>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaryRecords && filteredSalaryRecords.length > 0 ? (
                    filteredSalaryRecords.map((record, index) => (
                      <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1]`}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{record.employees?.full_name}</div>
                            <div className="text-xs text-gray-500">{record.employees?.employee_code}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrencyDollar(record.basic_salary || 0)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrencyDollar(record.hra || 0)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrencyDollar((record.conveyance || 0) + (record.bonus_amount || 0) + (record.overtime_amount || 0) + (record.other_earnings || 0))}</td>
                        <td className="px-4 py-3 text-right">{formatCurrencyDollar(record.gross_earnings || 0)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrencyDollar(record.total_deductions || 0)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrencyDollar(record.net_salary || 0)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            record.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-4">
                            <FileText size={32} className="text-[#1A5C34]" />
                          </div>
                          <p className="text-gray-500 font-medium">{language === 'hi' ? 'कोई वेतन रिकॉर्ड नहीं मिला' : 'No salary records found'}</p>
                          <p className="text-sm text-gray-400 mt-1">{language === 'hi' ? 'वेतन बनाने के लिए वेतन टैब पर जाएं' : 'Go to Salaries tab to generate payroll'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employee Ledger */}
        {activeReport === 'ledger' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'तारीख' : 'Date'}</th>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'विवरण' : 'Description'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'जमा' : 'Credit'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'निकासी' : 'Debit'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'शेष' : 'Balance'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaryRecords && filteredSalaryRecords.length > 0 ? (
                    filteredSalaryRecords.map((record, index) => (
                      <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1]`}>
                        <td className="px-4 py-3">{record.payment_date ? formatDate(record.payment_date) : '-'}</td>
                        <td className="px-4 py-3">
                          {language === 'hi' ? 'वेतन भुगतान' : 'Salary Payment'} - {months[selectedMonth - 1].en} {selectedYear}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {record.payment_status === 'paid' ? formatCurrencyDollar(record.net_salary || 0) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">-</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrencyDollar(record.net_salary || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-4">
                            <User size={32} className="text-[#1A5C34]" />
                          </div>
                          <p className="text-gray-500 font-medium">{language === 'hi' ? 'कोई खाता रिकॉर्ड नहीं मिला' : 'No ledger records found'}</p>
                          <p className="text-sm text-gray-400 mt-1">{language === 'hi' ? 'कर्मचारी चुनें और वेतन टैब पर जाएं' : 'Select an employee and go to Salaries tab'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expense Register */}
        {activeReport === 'expense' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'कुल व्यय' : 'Total Expenses'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">
                  {formatCurrencyDollar((expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0))}
                </p>
              </div>
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'भुगतान किया गया' : 'Paid'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">
                  {formatCurrencyDollar((expenses || []).filter(e => e.payment_status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0))}
                </p>
              </div>
              <div className="bg-[#EDF7F1] rounded-lg p-4">
                <p className="text-sm text-gray-600">{language === 'hi' ? 'लंबित' : 'Pending'}</p>
                <p className="text-2xl font-bold text-[#1A5C34]">
                  {formatCurrencyDollar((expenses || []).filter(e => e.payment_status !== 'paid').reduce((sum, e) => sum + (e.amount || 0), 0))}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'तारीख' : 'Date'}</th>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'श्रेणी' : 'Category'}</th>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'विवरण' : 'Description'}</th>
                    <th className="px-4 py-3 text-right">{language === 'hi' ? 'राशि' : 'Amount'}</th>
                    <th className="px-4 py-3 text-left">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses && expenses.length > 0 ? (
                    expenses.map((expense, index) => (
                      <tr key={expense.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1]`}>
                        <td className="px-4 py-3">{formatDate(expense.expense_date)}</td>
                        <td className="px-4 py-3 capitalize">{expense.category}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{expense.description || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrencyDollar(expense.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            expense.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {expense.payment_status.charAt(0).toUpperCase() + expense.payment_status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-4">
                            <ChartBar size={32} className="text-[#1A5C34]" />
                          </div>
                          <p className="text-gray-500 font-medium">{language === 'hi' ? 'कोई व्यय रिकॉर्ड नहीं मिला' : 'No expense records found'}</p>
                          <p className="text-sm text-gray-400 mt-1">{language === 'hi' ? 'व्यय टैब पर जाएं व्यय जोड़ने के लिए' : 'Go to Expenses tab to add expenses'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Department Summary */}
        {activeReport === 'department' && (
          <div className="space-y-4">
            {employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['farm_manager', 'field_supervisor', 'office_staff'].map(role => {
                  const roleEmployees = employees.filter(e => e.role === role);
                  const roleSalary = (filteredSalaryRecords || []).filter(r =>
                    roleEmployees.some(e => e.id === r.employee_id)
                  );
                  return (
                    <div key={role} className="bg-[#EDF7F1] rounded-lg p-5 border border-[#E3EDE7]">
                      <p className="text-sm font-semibold text-gray-700 capitalize">{role.replace('_', ' ')}</p>
                      <p className="text-3xl font-bold text-[#1A5C34] mt-2">{roleEmployees.length} <span className="text-lg font-medium text-gray-600">{language === 'hi' ? 'कर्मचारी' : 'employees'}</span></p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrencyDollar(roleSalary.reduce((sum, r) => sum + (r.net_salary || 0), 0))}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mx-auto mb-4">
                  <ChartBar size={32} className="text-[#1A5C34]" />
                </div>
                <p className="text-gray-500 font-medium">{language === 'hi' ? 'कोई कर्मचारी नहीं मिला' : 'No employees found'}</p>
                <p className="text-sm text-gray-400 mt-1">{language === 'hi' ? 'कर्मचारी टैब पर जाएं कर्मचारी जोड़ने के लिए' : 'Go to Employees tab to add employees'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
