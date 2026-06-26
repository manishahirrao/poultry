'use client';

import { useState } from 'react';
import { Plus, PencilSimple, Trash, Gear } from '@phosphor-icons/react';
import useSWR from 'swr';

interface PayrollComponent {
  id: string;
  component_name: string;
  component_type: 'earning' | 'deduction' | 'statutory';
  is_taxable: boolean;
  is_pf_applicable: boolean;
  display_order: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function PayrollSetup() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<PayrollComponent | null>(null);
  const [formData, setFormData] = useState({
    componentName: '',
    componentType: 'earning' as 'earning' | 'deduction' | 'statutory',
    isTaxable: true,
    isPfApplicable: false,
    displayOrder: 0,
  });

  const { data: components, mutate } = useSWR<PayrollComponent[]>(
    '/api/payroll/components',
    fetcher,
    { revalidateOnFocus: false }
  );

  const componentTypes = [
    { value: 'earning', label: 'Earning / कमाई' },
    { value: 'deduction', label: 'Deduction / कटौती' },
    { value: 'statutory', label: 'Statutory / वैधानिक' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/payroll/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        mutate();
        setIsFormOpen(false);
        setFormData({
          componentName: '',
          componentType: 'earning',
          isTaxable: true,
          isPfApplicable: false,
          displayOrder: 0,
        });
        setEditingComponent(null);
      }
    } catch (error) {
      console.error('Error creating component:', error);
    }
  };

  const handleEdit = (component: PayrollComponent) => {
    setEditingComponent(component);
    setFormData({
      componentName: component.component_name,
      componentType: component.component_type,
      isTaxable: component.is_taxable,
      isPfApplicable: component.is_pf_applicable,
      displayOrder: component.display_order,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'इस घटक को हटाएं? यह क्रिया पूर्ववत नहीं की जा सकती।' : 'Delete this component? This action cannot be undone.')) return;
    try {
      await fetch(`/api/payroll/components/${id}`, { method: 'DELETE' });
      mutate();
    } catch (error) {
      console.error('Error deleting component:', error);
    }
  };

  const typeColors = {
    earning: 'bg-green-50 text-green-700 border-green-200',
    deduction: 'bg-red-50 text-red-700 border-red-200',
    statutory: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center">
              <Gear size={24} className="text-[#1A5C34]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'hi' ? 'वेतन घटक सेटअप' : 'Payroll Components Setup'}
              </h3>
              <p className="text-sm text-gray-500">
                {language === 'hi' ? 'कमाई, कटौती और वैधानिक घटक परिभाषित करें' : 'Define earnings, deductions, and statutory components'}
              </p>
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
              {language === 'hi' ? 'घटक जोड़ें' : 'Add Component'}
            </button>
          </div>
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'घटक नाम' : 'Component Name'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'प्रकार' : 'Type'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'कर योग्य' : 'Taxable'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'PF लागू' : 'PF Applicable'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'क्रम' : 'Order'}</th>
                <th className="px-4 py-3 text-left">{language === 'hi' ? 'क्रियाएं' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {components && components.length > 0 ? (
                components.map((component, index) => (
                  <tr key={component.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1]`}>
                    <td className="px-4 py-3 font-medium">{component.component_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${typeColors[component.component_type]}`}>
                        {component.component_type.charAt(0).toUpperCase() + component.component_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {component.is_taxable ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {component.is_pf_applicable ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{component.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(component)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          title={language === 'hi' ? 'संपादित करें' : 'Edit'}
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(component.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title={language === 'hi' ? 'हटाएं' : 'Delete'}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-4">
                        <Gear size={32} className="text-[#1A5C34]" />
                      </div>
                      <p className="text-gray-500 font-medium">{language === 'hi' ? 'कोई वेतन घटक नहीं मिला' : 'No payroll components found'}</p>
                      <p className="text-sm text-gray-400 mt-1">{language === 'hi' ? 'घटक जोड़ने के लिए बटन पर क्लिक करें' : 'Click the button above to add components'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Component Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#E3EDE7] flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingComponent 
                  ? (language === 'hi' ? 'घटक संपादित करें' : 'Edit Component')
                  : (language === 'hi' ? 'नया घटक जोड़ें' : 'Add New Component')
                }
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingComponent(null);
                  setFormData({
                    componentName: '',
                    componentType: 'earning',
                    isTaxable: true,
                    isPfApplicable: false,
                    displayOrder: 0,
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'घटक नाम' : 'Component Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.componentName}
                  onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                  placeholder={language === 'hi' ? 'उदा: मूल वेतन, HRA' : 'e.g., Basic Salary, HRA'}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'घटक प्रकार' : 'Component Type'}
                </label>
                <select
                  required
                  value={formData.componentType}
                  onChange={(e) => setFormData({ ...formData, componentType: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                >
                  {componentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTaxable}
                    onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                    className="w-4 h-4 text-[#1A5C34] rounded focus:ring-[#3DAE72]"
                  />
                  <span className="text-sm text-gray-700">{language === 'hi' ? 'कर योग्य' : 'Taxable'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPfApplicable}
                    onChange={(e) => setFormData({ ...formData, isPfApplicable: e.target.checked })}
                    className="w-4 h-4 text-[#1A5C34] rounded focus:ring-[#3DAE72]"
                  />
                  <span className="text-sm text-gray-700">{language === 'hi' ? 'PF लागू' : 'PF Applicable'}</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'प्रदर्शन क्रम' : 'Display Order'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingComponent(null);
                    setFormData({
                      componentName: '',
                      componentType: 'earning',
                      isTaxable: true,
                      isPfApplicable: false,
                      displayOrder: 0,
                    });
                  }}
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
