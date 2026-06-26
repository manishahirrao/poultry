'use client';

import { User, Buildings, Calendar, CurrencyDollar, CheckCircle, WarningCircle } from '@phosphor-icons/react';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  name_hindi?: string;
  phone: string;
  role: string;
  role_custom?: string;
  assigned_farm_ids?: string[];
  assigned_farm_names?: string[];
  employment_type: string;
  join_date: string;
  end_date?: string;
  is_active: boolean;
  base_salary_monthly?: number;
  daily_wage_rate?: number;
  salary_status?: 'paid' | 'pending' | 'on_hold';
  salary_month?: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeCardProps {
  employee: Employee;
  language?: 'en' | 'hi';
  onViewDetails: (employee: Employee) => void;
  onProcessSalary: (employee: Employee) => void;
}

const ROLE_LABELS: Record<string, { en: string; hi: string }> = {
  farm_manager: { en: 'Farm Manager', hi: 'फार्म मैनेजर' },
  field_supervisor: { en: 'Field Supervisor', hi: 'फील्ड सुपरवाइजर' },
  farm_worker: { en: 'Farm Worker', hi: 'फार्म वर्कर' },
  driver: { en: 'Driver', hi: 'ड्राइवर' },
  accountant: { en: 'Accountant', hi: 'अकाउंटेंट' },
  office_staff: { en: 'Office Staff', hi: 'ऑफिस स्टाफ' },
  other: { en: 'Other', hi: 'अन्य' },
};

const EMPLOYMENT_TYPE_LABELS: Record<string, { en: string; hi: string }> = {
  permanent: { en: 'Permanent', hi: 'स्थायी' },
  contractual: { en: 'Contractual', hi: 'अनुबंधित' },
  daily_wage: { en: 'Daily Wage', hi: 'दैनिक मजदूरी' },
  part_time: { en: 'Part Time', hi: 'अंशकालिक' },
};

// Brand colors from specs
const BRAND_COLORS = {
  brand700: '#1A5C34',
  brand400: '#3DAE72',
  brand50: '#EDF7F1',
  signal: '#E8611A',
  amber: '#D97706',
  red: '#DC2626',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E3EDE7',
};

export function EmployeeCard({ employee, language = 'en', onViewDetails, onProcessSalary }: EmployeeCardProps) {
  const isHindi = language === 'hi';

  const getRoleLabel = (role: string, custom?: string) => {
    if (role === 'other' && custom) return custom;
    return ROLE_LABELS[role]?.[language] || role;
  };

  const getEmploymentTypeLabel = (type: string) => {
    return EMPLOYMENT_TYPE_LABELS[type]?.[language] || type;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSalaryDisplay = () => {
    if (employee.base_salary_monthly) {
      return `₹${employee.base_salary_monthly.toLocaleString('en-IN')}/month`;
    }
    if (employee.daily_wage_rate) {
      return `₹${employee.daily_wage_rate.toLocaleString('en-IN')}/day`;
    }
    return isHindi ? 'वेतन नहीं निर्धारित' : 'Salary not set';
  };

  const getSalaryStatusDisplay = () => {
    if (!employee.salary_status) return null;

    const monthLabel = employee.salary_month 
      ? new Date(employee.salary_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '';

    if (employee.salary_status === 'paid') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-700">
          <CheckCircle size={14} weight="fill" />
          <span>{isHindi ? 'भुगतान — ' : 'Paid — '}{monthLabel}</span>
        </div>
      );
    }

    if (employee.salary_status === 'pending') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <WarningCircle size={14} weight="fill" />
          <span>{isHindi ? 'लंबित — ' : 'Pending — '}{monthLabel}</span>
        </div>
      );
    }

    if (employee.salary_status === 'on_hold') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-red-700">
          <WarningCircle size={14} weight="fill" />
          <span>{isHindi ? 'रोका गया — ' : 'On Hold — '}{monthLabel}</span>
        </div>
      );
    }

    return null;
  };

  const getAssignedFarmsDisplay = () => {
    if (!employee.assigned_farm_names || employee.assigned_farm_names.length === 0) {
      return (
        <span className="text-xs text-gray-500">
          {isHindi ? 'फार्म असाइन नहीं' : 'No farms assigned'}
        </span>
      );
    }

    const visibleFarms = employee.assigned_farm_names.slice(0, 2);
    const remainingCount = employee.assigned_farm_names.length - 2;

    return (
      <div className="flex flex-wrap gap-1.5">
        {visibleFarms.map((farmName, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#EDF7F1] text-[#1A5C34]"
          >
            {farmName}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-[10px] text-gray-500">
            +{remainingCount} {isHindi ? 'अधिक' : 'more'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: BRAND_COLORS.brand700 }}
          >
            {getInitials(employee.full_name)}
          </div>
          <div>
            <h3 className="font-semibold text-[#111827]">{employee.full_name}</h3>
            {employee.name_hindi && (
              <p className="text-sm text-[#6B7280]">{employee.name_hindi}</p>
            )}
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
            employee.is_active
              ? 'bg-[#EDF7F1] text-[#1A5C34]'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {employee.is_active
            ? isHindi
              ? 'सक्रिय'
              : 'Active'
            : isHindi
              ? 'निष्क्रिय'
              : 'Inactive'}
        </span>
      </div>

      {/* Role and Employment Type Badges */}
      <div className="flex gap-2 mb-3">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#EDF7F1] text-[#1A5C34]"
        >
          {getRoleLabel(employee.role, employee.role_custom)}
        </span>
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700"
        >
          {getEmploymentTypeLabel(employee.employment_type)}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-4">
        {/* Assigned Farms */}
        <div className="flex items-start gap-2">
          <Buildings size={16} className="text-[#6B7280] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {getAssignedFarmsDisplay()}
          </div>
        </div>

        {/* Join Date */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Calendar size={16} className="flex-shrink-0" />
          <span>
            {isHindi ? 'शामिल हुए: ' : 'Joined: '}
            {new Date(employee.join_date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-sm">
          <CurrencyDollar size={16} className="text-[#6B7280] flex-shrink-0" />
          <span className="font-medium text-[#111827]">{getSalaryDisplay()}</span>
        </div>

        {/* Salary Status */}
        {getSalaryStatusDisplay()}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-[#E3EDE7]">
        <button
          onClick={() => onViewDetails(employee)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#EDF7F1] text-[#1A5C34] rounded-lg hover:bg-[#3DAE72] hover:text-white transition-colors text-sm font-medium"
        >
          {isHindi ? 'विवरण देखें' : 'View Details'}
        </button>
        <button
          onClick={() => onProcessSalary(employee)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors text-sm font-medium"
        >
          {isHindi ? 'वेतन प्रक्रिया' : 'Process Salary'}
        </button>
      </div>
    </div>
  );
}
