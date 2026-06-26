'use client';

import { useState } from 'react';
import { Plus, Calendar, Tag, Receipt as ReceiptIcon, Trash, MapPin, Funnel, X } from '@phosphor-icons/react';
import useSWR from 'swr';
import { AddExpenseForm } from './AddExpenseForm';

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_mode: string;
  is_tax_deductible: boolean;
  gst_amount: number;
  receipt_url?: string;
  farm_id?: string;
  batch_id?: string;
  notes?: string;
  created_at: string;
  farms?: { id: string; name: string };
  batches?: { id: string; batch_number: string };
}

interface BusinessExpensesProps {
  expenses: Expense[];
}

const CATEGORY_LABELS: Record<string, { en: string; hi: string; icon: string }> = {
  veterinary_visit: { en: 'Veterinary Visit', hi: 'पशु चिकित्सक यात्रा', icon: '🏥' },
  farm_repair: { en: 'Farm Repair', hi: 'फार्म मरम्मत', icon: '🔧' },
  equipment_purchase: { en: 'Equipment Purchase', hi: 'उपकरण खरीद', icon: '🔧' },
  equipment_maintenance: { en: 'Equipment Maintenance', hi: 'उपकरण रखरखाव', icon: '🔧' },
  vehicle_fuel: { en: 'Vehicle Fuel', hi: 'वाहन ईंधन', icon: '⛽' },
  vehicle_maintenance: { en: 'Vehicle Maintenance', hi: 'वाहन रखरखाव', icon: '🔧' },
  vehicle_insurance: { en: 'Vehicle Insurance', hi: 'वाहन बीमा', icon: '🛡️' },
  office_supplies: { en: 'Office Supplies', hi: 'कार्यालय सामग्री', icon: '📦' },
  communication: { en: 'Communication', hi: 'संचार', icon: '📱' },
  internet: { en: 'Internet', hi: 'इंटरनेट', icon: '🌐' },
  printing: { en: 'Printing', hi: 'प्रिंटिंग', icon: '🖨️' },
  audit_fees: { en: 'Audit Fees', hi: 'ऑडिट शुल्क', icon: '📊' },
  legal_fees: { en: 'Legal Fees', hi: 'विधि शुल्क', icon: '⚖️' },
  consultant_fees: { en: 'Consultant Fees', hi: 'सलाहकार शुल्क', icon: '👔' },
  travel: { en: 'Travel', hi: 'यात्रा', icon: '✈️' },
  insurance: { en: 'Insurance', hi: 'बीमा', icon: '🛡️' },
  rent: { en: 'Rent', hi: 'किराया', icon: '🏢' },
  utilities: { en: 'Utilities', hi: 'उपयोगिता', icon: '💡' },
  professional_fees: { en: 'Professional Fees', hi: 'पेशेवर शुल्क', icon: '👔' },
  marketing: { en: 'Marketing', hi: 'मार्केटिंग', icon: '📢' },
  miscellaneous: { en: 'Miscellaneous', hi: 'विविध', icon: '📝' },
  bank_charges: { en: 'Bank Charges', hi: 'बैंक शुल्क', icon: '🏦' },
  equipment: { en: 'Equipment', hi: 'उपकरण', icon: '🔧' },
  office: { en: 'Office', hi: 'ऑफिस', icon: '🏢' },
  other: { en: 'Other', hi: 'अन्य', icon: '📝' },
};

export function BusinessExpenses({ expenses: initialExpenses }: BusinessExpensesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<'this_month' | 'last_3_months' | 'this_year'>('this_month');

  const { data: expenses, mutate } = useSWR('/api/expenses', {
    fallbackData: initialExpenses,
  });

  const { data: farms } = useSWR('/api/farms');

  // SlidersHorizontal expenses based on selected filters
  const filteredExpenses: Expense[] = expenses?.filter((expense: Expense) => {
    const categoryMatch = selectedCategory === 'all' || expense.category === selectedCategory;
    const farmMatch = selectedFarm === 'all' || expense.farm_id === selectedFarm;
    
    let timeMatch = true;
    const expenseDate = new Date(expense.expense_date);
    const now = new Date();
    
    if (timePeriod === 'this_month') {
      timeMatch = expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    } else if (timePeriod === 'last_3_months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      timeMatch = expenseDate >= threeMonthsAgo;
    } else if (timePeriod === 'this_year') {
      timeMatch = expenseDate.getFullYear() === now.getFullYear();
    }
    
    return categoryMatch && farmMatch && timeMatch;
  }) || [];

  // Calculate summary stats
  const totalAmount = filteredExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
  const farmLinkedAmount = filteredExpenses.reduce((sum: number, exp: Expense) => sum + (exp.farm_id ? exp.amount : 0), 0);
  const generalBusinessAmount = filteredExpenses.reduce((sum: number, exp: Expense) => sum + (!exp.farm_id ? exp.amount : 0), 0);
  const taxDeductibleAmount = filteredExpenses.reduce((sum: number, exp: Expense) => sum + (exp.is_tax_deductible ? exp.amount : 0), 0);

  const getCategoryLabel = (category: string) => {
    return CATEGORY_LABELS[category] || { en: category, hi: category, icon: '📝' };
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप वाकई इस खर्च को हटाना चाहते हैं?' : 'Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const isHindi = language === 'hi';

  return (
    <div className="space-y-6">
      {/* SlidersHorizontal Bar */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Time Period SlidersHorizontal */}
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as any)}
                className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              >
                <option value="this_month">{isHindi ? 'इस महीने' : 'This Month'}</option>
                <option value="last_3_months">{isHindi ? 'पिछले 3 महीने' : 'Last 3 Months'}</option>
                <option value="this_year">{isHindi ? 'इस साल' : 'This Year'}</option>
              </select>
            </div>

            {/* Category SlidersHorizontal */}
            <div className="flex items-center gap-2">
              <Tag size={20} className="text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              >
                <option value="all">{isHindi ? 'सभी श्रेणियां' : 'All Categories'}</option>
                {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.icon} {isHindi ? value.hi : value.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Farm SlidersHorizontal */}
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-gray-500" />
              <select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                className="px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              >
                <option value="all">{isHindi ? 'सभी फार्म' : 'All Farms'}</option>
                {farms?.map((farm: any) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-sm ${language === 'en' ? 'bg-[#EDF7F1] text-[#1A5C34]' : 'bg-gray-100 text-gray-600'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-lg text-sm ${language === 'hi' ? 'bg-[#EDF7F1] text-[#1A5C34]' : 'bg-gray-100 text-gray-600'}`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
            >
              <Plus size={20} />
              {isHindi ? 'खर्च जोड़ें' : 'Add Expense'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center">
              <ReceiptIcon size={24} className="text-[#1A5C34]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{isHindi ? 'कुल खर्च' : 'Total'}</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center">
              <MapPin size={24} className="text-[#1A5C34]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{isHindi ? 'फार्म-लिंक्ड' : 'Farm-linked'}</p>
              <p className="text-2xl font-bold text-gray-900">₹{farmLinkedAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center">
              <Funnel size={24} className="text-[#1A5C34]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{isHindi ? 'सामान्य व्यवसाय' : 'General Business'}</p>
              <p className="text-2xl font-bold text-gray-900">₹{generalBusinessAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center">
              <Tag size={24} className="text-[#1A5C34]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{isHindi ? 'कर कटौती योग्य' : 'Tax Deductible'}</p>
              <p className="text-2xl font-bold text-gray-900">₹{taxDeductibleAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Form (Inline) */}
      {showAddForm && (
        <AddExpenseForm
          onSuccess={() => {
            setShowAddForm(false);
            mutate();
          }}
          onCancel={() => setShowAddForm(false)}
          language={language}
        />
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
        <div className="p-6 border-b border-[#E3EDE7]">
          <h2 className="text-lg font-semibold text-gray-900">{isHindi ? 'खर्च रिकॉर्ड' : 'Expense Records'}</h2>
        </div>
        
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F7F5]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'दिनांक' : 'Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'श्रेणी' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'विवरण' : 'Description'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'फार्म' : 'Farm'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'राशि' : 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'भुगतान का तरीका' : 'Payment Mode'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'रसीद' : 'Receipt'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isHindi ? 'क्रियाएं' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EDE7]">
                {filteredExpenses.map((expense: Expense) => {
                  const catLabel = getCategoryLabel(expense.category);
                  return (
                    <tr key={expense.id} className="hover:bg-[#F4F7F5]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="flex items-center gap-2">
                          <span>{catLabel.icon}</span>
                          <span>{isHindi ? catLabel.hi : catLabel.en}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.farms?.name || (isHindi ? 'सामान्य' : 'General')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.payment_mode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {expense.receipt_url ? (
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#3DAE72] hover:underline"
                          >
                            {isHindi ? 'देखें' : 'View'}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-700"
                          title={isHindi ? 'हटाएं' : 'Delete'}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ReceiptIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isHindi ? 'कोई खर्च दर्ज नहीं' : 'No expenses recorded'}
            </h3>
            <p className="text-gray-500 mb-4">
              {isHindi ? 'ट्रैकिंग शुरू करने के लिए अपना पहला खर्च जोड़ें' : 'Add your first expense to start tracking'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
            >
              <Plus size={20} />
              {isHindi ? 'खर्च जोड़ें' : 'Add Expense'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
