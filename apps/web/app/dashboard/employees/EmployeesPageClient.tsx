'use client'

import { EmployeeList } from '@/components/employees/EmployeeList'
import { SalaryManagement } from '@/components/employees/SalaryManagement'
import { BusinessExpenses } from '@/components/employees/BusinessExpenses'
import { PLOverview } from '@/components/employees/PLOverview'
import { LeaveManagement } from '@/components/employees/LeaveManagement'
import { PayrollSetup } from '@/components/employees/PayrollSetup'
import { PayrollReports } from '@/components/employees/PayrollReports'
import { useEntitlements } from '@/lib/plans/useEntitlements'
import { canAccess, FEATURES } from '@/lib/plans/featureGates'
import { PlanUpgradePrompt } from '@/components/plans/PlanUpgradePrompt'

interface EmployeesPageClientProps {
  employees: any[]
  expenses: any[]
  farms: any[]
  integratorId: string
  activeTab: string
}

export function EmployeesPageClient({
  employees,
  expenses,
  farms,
  integratorId,
  activeTab,
}: EmployeesPageClientProps) {
  const { entitlements } = useEntitlements()

  // ── Feature access check for employee management ───────────────────────────────
  const employeeAccess = canAccess(entitlements, FEATURES.EMPLOYEE_MANAGEMENT)

  if (!employeeAccess.hasAccess) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <div className="mb-8 md:mb-12 flex justify-between items-start">
          <div>
            <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
              Analytics
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Employees & Expenses</h1>
            <p className="text-base text-neutral-600 mt-2">
              Manage your farm workers, salaries, and business expenses
            </p>
          </div>
        </div>
        <PlanUpgradePrompt
          feature={FEATURES.EMPLOYEE_MANAGEMENT}
          upgradeTarget="FLOCKIQ_PRO"
        />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12 flex justify-between items-start">
        <div>
          <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
            Analytics
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Employees & Expenses</h1>
          <p className="text-base text-neutral-600 mt-2">
            Manage your farm workers, salaries, and business expenses
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6 flex-wrap">
          <a
            href="/dashboard/employees?tab=employees"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'employees'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Employees
          </a>
          <a
            href="/dashboard/employees?tab=salaries"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'salaries'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 Salaries
          </a>
          <a
            href="/dashboard/employees?tab=leave"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leave'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🏖️ Leave
          </a>
          <a
            href="/dashboard/employees?tab=payroll-setup"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payroll-setup'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚙️ Payroll Setup
          </a>
          <a
            href="/dashboard/employees?tab=reports"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Reports
          </a>
          <a
            href="/dashboard/employees?tab=expenses"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'expenses'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Expenses
          </a>
          <a
            href="/dashboard/employees?tab=pl"
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pl'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 P&L Overview
          </a>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && <EmployeeList employees={employees} farms={farms} />}
      {activeTab === 'salaries' && <SalaryManagement employees={employees} />}
      {activeTab === 'leave' && <LeaveManagement employees={employees} />}
      {activeTab === 'payroll-setup' && <PayrollSetup />}
      {activeTab === 'reports' && <PayrollReports employees={employees} integratorId={integratorId} />}
      {activeTab === 'expenses' && <BusinessExpenses expenses={expenses} />}
      {activeTab === 'pl' && <PLOverview integratorId={integratorId} />}
    </div>
  )
}
