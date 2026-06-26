'use client';

import { useState, useMemo } from 'react';
import { Plus, Funnel, X, Buildings } from '@phosphor-icons/react';
import useSWR from 'swr';
import { EmployeeCard } from './EmployeeCard';
import { AddEmployeePanel } from './AddEmployeePanel';

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

interface EmployeeListProps {
  employees: Employee[];
  farms?: Array<{ id: string; name: string }>;
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
  border: '#E3EDE7',
};

export function EmployeeList({ employees: initialEmployees, farms = [] }: EmployeeListProps) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: employees, mutate } = useSWR('/api/employees', {
    fallbackData: initialEmployees,
  });

  // Fetch farms if not provided
  const { data: farmsData } = useSWR('/api/farms');
  const allFarms = farms.length > 0 ? farms : (farmsData || []);

  // SlidersHorizontal employees based on selected filters
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return employees.filter((employee: Employee) => {
      // Role filter
      if (selectedRole !== 'all' && employee.role !== selectedRole) return false;

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active' && !employee.is_active) return false;
        if (selectedStatus === 'inactive' && employee.is_active) return false;
      }

      // Farm filter
      if (selectedFarm !== 'all') {
        if (!employee.assigned_farm_ids || !employee.assigned_farm_ids.includes(selectedFarm)) {
          return false;
        }
      }

      return true;
    });
  }, [employees, selectedRole, selectedFarm, selectedStatus]);

  const handleViewDetails = (employee: Employee) => {
    // TODO: Implement view details modal or navigate to detail page
    console.log('View details for:', employee);
  };

  const handleProcessSalary = (employee: Employee) => {
    // Navigate to salaries tab with this employee selected
    window.location.href = `/dashboard/employees?tab=salaries&employee=${employee.id}`;
  };

  const handleAddSuccess = () => {
    mutate();
  };

  const clearSlidersHorizontals = () => {
    setSelectedRole('all');
    setSelectedFarm('all');
    setSelectedStatus('all');
  };

  const hasActiveSlidersHorizontals = selectedRole !== 'all' || selectedFarm !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              language === 'en' 
                ? 'bg-[#EDF7F1] text-[#1A5C34]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              language === 'hi' 
                ? 'bg-[#EDF7F1] text-[#1A5C34]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            हिंदी
          </button>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors text-sm font-medium"
        >
          <Plus size={20} />
          {language === 'hi' ? 'कर्मचारी जोड़ें' : 'Add Employee'}
        </button>
      </div>

      {/* SlidersHorizontal Bar */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Funnel size={18} className="text-[#6B7280]" />
            <span className="text-sm font-medium text-[#111827]">
              {language === 'hi' ? 'फ़िल्टर' : 'SlidersHorizontals'}:
            </span>
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            {/* Role SlidersHorizontal */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent bg-white"
            >
              <option value="all">{language === 'hi' ? 'सभी भूमिकाएं' : 'All Roles'}</option>
              {Object.entries(ROLE_LABELS).map(([value, labels]) => (
                <option key={value} value={value}>
                  {labels[language]}
                </option>
              ))}
            </select>

            {/* Farm SlidersHorizontal */}
            <select
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="px-3 py-2 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent bg-white"
            >
              <option value="all">{language === 'hi' ? 'सभी फार्म' : 'All Farms'}</option>
              {allFarms.map((farm: any) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>

            {/* Status SlidersHorizontal */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent bg-white"
            >
              <option value="all">{language === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
              <option value="active">{language === 'hi' ? 'सक्रिय' : 'Active'}</option>
              <option value="inactive">{language === 'hi' ? 'निष्क्रिय' : 'Inactive'}</option>
            </select>

            {/* Clear SlidersHorizontals */}
            {hasActiveSlidersHorizontals && (
              <button
                onClick={clearSlidersHorizontals}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                <X size={16} />
                {language === 'hi' ? 'साफ़ करें' : 'Clear'}
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-[#6B7280]">
            {language === 'hi' ? 'दिखा रहा है' : 'Showing'} {filteredEmployees.length} {language === 'hi' ? 'कर्मचारी' : 'employees'}
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee: Employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              language={language}
              onViewDetails={handleViewDetails}
              onProcessSalary={handleProcessSalary}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-12 text-center">
          <Buildings size={48} className="mx-auto text-[#6B7280] mb-4" />
          <h3 className="text-lg font-semibold text-[#111827] mb-2">
            {hasActiveSlidersHorizontals 
              ? (language === 'hi' ? 'कोई कर्मचारी नहीं मिला' : 'No employees found')
              : (language === 'hi' ? 'अभी तक कोई कर्मचारी नहीं' : 'No employees yet')
            }
          </h3>
          <p className="text-[#6B7280] mb-4">
            {hasActiveSlidersHorizontals
              ? (language === 'hi' ? 'फ़िल्टर समायोजित करें या साफ़ करें' : 'Adjust filters or clear them')
              : (language === 'hi' ? 'शुरू करने के लिए अपना पहला कर्मचारी जोड़ें' : 'Add your first employee to get started')
            }
          </p>
          {!hasActiveSlidersHorizontals && (
            <button
              onClick={() => setShowAddPanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors text-sm font-medium"
            >
              <Plus size={20} />
              {language === 'hi' ? 'कर्मचारी जोड़ें' : 'Add Employee'}
            </button>
          )}
        </div>
      )}

      {/* Add Employee Panel */}
      <AddEmployeePanel
        isOpen={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        onSuccess={handleAddSuccess}
        language={language}
      />
    </div>
  );
}
