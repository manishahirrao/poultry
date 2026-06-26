'use client';

import { useState } from 'react';
import { Calendar, Plus, Check, X, User, Clock } from '@phosphor-icons/react';
import useSWR from 'swr';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  name_hindi?: string;
}

interface LeaveManagementProps {
  employees: Employee[];
}

interface LeaveEntry {
  id: string;
  employee_id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days_count: number;
  status: string;
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  employees?: {
    employee_code: string;
    full_name: string;
    name_hindi?: string;
  };
}

interface LeaveBalance {
  policy: {
    casual_leave_days: number;
    sick_leave_days: number;
    earned_leave_days: number;
  };
  usedLeave: {
    casual: number;
    sick: number;
    earned: number;
  };
  balance: {
    casual: number;
    sick: number;
    earned: number;
  };
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function LeaveManagement({ employees }: LeaveManagementProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    daysCount: 0,
    reason: '',
  });

  const { data: leaveEntries, mutate } = useSWR<LeaveEntry[]>(
    '/api/payroll/leave-entries',
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: leaveBalance } = useSWR<LeaveBalance>(
    selectedEmployee ? `/api/payroll/leave-balance?employeeId=${selectedEmployee}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave / अवकाश अवकाश' },
    { value: 'sick', label: 'Sick Leave / बीमारी अवकाश' },
    { value: 'earned', label: 'Earned Leave / अर्जित अवकाश' },
    { value: 'unpaid', label: 'Unpaid Leave / अवैतनिक अवकाश' },
  ];

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const handleCalculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, daysCount: diffDays });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/payroll/leave-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        mutate();
        setIsFormOpen(false);
        setFormData({
          employeeId: '',
          leaveType: 'casual',
          fromDate: '',
          toDate: '',
          daysCount: 0,
          reason: '',
        });
      }
    } catch (error) {
      console.error('Error creating leave entry:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm(language === 'hi' ? 'इस अवकाश को स्वीकृत करें?' : 'Approve this leave?')) return;
    try {
      await fetch(`/api/payroll/leave-entries/${id}/approve`, { method: 'POST' });
      mutate();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm(language === 'hi' ? 'इस अवकाश को अस्वीकार करें?' : 'Reject this leave?')) return;
    try {
      await fetch(`/api/payroll/leave-entries/${id}/reject`, { method: 'POST' });
      mutate();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <User size={20} className="text-gray-500" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              >
                <option value="">All Employees / सभी कर्मचारी</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
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
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#1A5C34]/90 transition-colors"
            >
              <Plus size={20} />
              {language === 'hi' ? 'नई अवकाश प्रविष्टि' : 'New Leave Entry'}
            </button>
          </div>
        </div>
      </div>

      {/* Leave Balance Summary */}
      {selectedEmployee && leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'hi' ? 'अवकाश अवकाश' : 'Casual Leave'}</p>
                <p className="text-2xl font-bold text-gray-900">{leaveBalance.balance.casual} / {leaveBalance.policy.casual_leave_days}</p>
                <p className="text-xs text-gray-400">{language === 'hi' ? 'प्रयुक्त:' : 'Used:'} {leaveBalance.usedLeave.casual}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Calendar size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'hi' ? 'बीमारी अवकाश' : 'Sick Leave'}</p>
                <p className="text-2xl font-bold text-gray-900">{leaveBalance.balance.sick} / {leaveBalance.policy.sick_leave_days}</p>
                <p className="text-xs text-gray-400">{language === 'hi' ? 'प्रयुक्त:' : 'Used:'} {leaveBalance.usedLeave.sick}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'hi' ? 'अर्जित अवकाश' : 'Earned Leave'}</p>
                <p className="text-2xl font-bold text-gray-900">{leaveBalance.balance.earned} / {leaveBalance.policy.earned_leave_days}</p>
                <p className="text-xs text-gray-400">{language === 'hi' ? 'प्रयुक्त:' : 'Used:'} {leaveBalance.usedLeave.earned}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Register Table */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3EDE7]">
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'hi' ? 'अवकाश रजिस्टर' : 'Leave Register'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'कर्मचारी' : 'Employee'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'प्रकार' : 'Type'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'से' : 'From'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'तक' : 'To'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'दिन' : 'Days'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'कारण' : 'Reason'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'क्रियाएं' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {leaveEntries && leaveEntries.length > 0 ? (
                leaveEntries.map((entry, index) => (
                  <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1]`}>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{entry.employees?.full_name}</div>
                        <div className="text-xs text-gray-500">{entry.employees?.employee_code}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{entry.leave_type}</td>
                    <td className="px-4 py-3">{formatDate(entry.from_date)}</td>
                    <td className="px-4 py-3">{formatDate(entry.to_date)}</td>
                    <td className="px-4 py-3">{entry.days_count}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusColors[entry.status as keyof typeof statusColors]}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{entry.reason || '-'}</td>
                    <td className="px-4 py-3">
                      {entry.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(entry.id)}
                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                            title={language === 'hi' ? 'स्वीकृत करें' : 'Approve'}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(entry.id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            title={language === 'hi' ? 'अस्वीकार करें' : 'Reject'}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-4">
                        <Calendar size={32} className="text-[#1A5C34]" />
                      </div>
                      <p className="text-gray-500 font-medium">{language === 'hi' ? 'कोई अवकाश प्रविष्टि नहीं मिली' : 'No leave entries found'}</p>
                      <p className="text-sm text-gray-400 mt-1">{language === 'hi' ? 'नई अवकाश प्रविष्टि बनाने के लिए बटन पर क्लिक करें' : 'Click the button above to create a new leave entry'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Leave Entry Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#E3EDE7] flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'hi' ? 'नई अवकाश प्रविष्टि' : 'New Leave Entry'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'कर्मचारी' : 'Employee'}
                </label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                >
                  <option value="">{language === 'hi' ? 'कर्मचारी चुनें' : 'Select Employee'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'अवकाश प्रकार' : 'Leave Type'}
                </label>
                <select
                  required
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'hi' ? 'से तारीख' : 'From Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(e) => {
                      setFormData({ ...formData, fromDate: e.target.value });
                      handleCalculateDays();
                    }}
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'hi' ? 'तक तारीख' : 'To Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.toDate}
                    onChange={(e) => {
                      setFormData({ ...formData, toDate: e.target.value });
                      handleCalculateDays();
                    }}
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'दिनों की संख्या' : 'Number of Days'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.daysCount}
                  onChange={(e) => setFormData({ ...formData, daysCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'कारण' : 'Reason'}
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder={language === 'hi' ? 'वैकल्पिक: अवकाश का कारण बताएं' : 'Optional: Provide reason for leave'}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[#E3EDE7] rounded-lg hover:bg-[#F4F7F5] transition-colors font-medium"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#1A5C34] text-white rounded-lg hover:bg-[#1A5C34]/90 transition-colors font-medium shadow-sm"
                >
                  {language === 'hi' ? 'जमा करें' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
