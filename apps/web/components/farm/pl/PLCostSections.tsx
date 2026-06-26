'use client';

import { useState } from 'react';
import { PencilSimple } from '@phosphor-icons/react';
import { ChickCostSection } from './ChickCostSection';
import { FeedCostSection } from './FeedCostSection';
import { MedicineCostSection } from './MedicineCostSection';
import { LabourCostSection } from './LabourCostSection';
import { OverheadCostSection } from './OverheadCostSection';
import { OtherCostSection } from './OtherCostSection';

interface BatchCostRecord {
  cost_id: string;
  category: string;
  amount: number;
  description: string;
  entry_date: string;
}

interface FeedCosts {
  total: number;
  avg_rate: number;
  total_mt: number;
  last_updated?: string;
}

interface BatchData {
  breed: string;
  placement_date: string;
  birds_placed: number;
  current_day: number;
  target_days: number;
}

interface PLCostSectionsProps {
  costs: BatchCostRecord[];
  medicineCosts: BatchCostRecord[];
  feedCosts: FeedCosts;
  farmId: string;
  batchId: string;
  batchData?: BatchData;
}

export function PLCostSections({ costs, medicineCosts, feedCosts, farmId, batchId, batchData }: PLCostSectionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Check if each section has data
  const chickCostData = costs.find(c => c.category === 'chick');
  const labourCostData = costs.filter(c => c.category === 'labour_daily' || c.category === 'labour_period');
  const overheadCostData = costs.filter(c => c.category === 'overhead');
  const otherCostData = costs.filter(c => c.category === 'other');

  return (
    <div className="space-y-4">
      {/* Chick Procurement Cost Section */}
      <CostSection
        id="chick"
        title="🐣 Chick Procurement Cost"
        icon="🐣"
        isExpanded={expandedSection === 'chick'}
        onToggle={() => toggleSection('chick')}
        hasData={!!chickCostData}
      >
        <ChickCostSection 
          farmId={farmId} 
          batchId={batchId} 
          initialData={chickCostData as any}
          batchData={batchData}
        />
      </CostSection>

      {/* Feed Cost Section */}
      <CostSection
        id="feed"
        title="🌽 Feed Cost"
        icon="🌽"
        isExpanded={expandedSection === 'feed'}
        onToggle={() => toggleSection('feed')}
        hasData={feedCosts.total > 0}
        isReadOnly
      >
        <FeedCostSection feedCosts={feedCosts} farmId={farmId} batchId={batchId} />
      </CostSection>

      {/* Medicine & Vaccine Cost Section */}
      <CostSection
        id="medicine"
        title="💊 Medicine & Vaccine Cost"
        icon="💊"
        isExpanded={expandedSection === 'medicine'}
        onToggle={() => toggleSection('medicine')}
        hasData={medicineCosts.length > 0}
      >
        <MedicineCostSection 
          medicineCosts={medicineCosts as any} 
          farmId={farmId} 
          batchId={batchId}
          batchDay={batchData?.current_day}
        />
      </CostSection>

      {/* Labour Cost Section */}
      <CostSection
        id="labour"
        title="👷 Labour Cost"
        icon="👷"
        isExpanded={expandedSection === 'labour'}
        onToggle={() => toggleSection('labour')}
        hasData={labourCostData.length > 0}
      >
        <LabourCostSection 
          farmId={farmId} 
          batchId={batchId} 
          initialData={labourCostData as any}
          batchData={batchData}
        />
      </CostSection>

      {/* Overhead Cost Section */}
      <CostSection
        id="overhead"
        title="⚡ Overhead Cost"
        icon="⚡"
        isExpanded={expandedSection === 'overhead'}
        onToggle={() => toggleSection('overhead')}
        hasData={overheadCostData.length > 0}
      >
        <OverheadCostSection 
          farmId={farmId} 
          batchId={batchId} 
          initialData={overheadCostData as any}
          batchData={batchData}
        />
      </CostSection>

      {/* Other Costs Section */}
      <CostSection
        id="other"
        title="📎 Other Costs"
        icon="📎"
        isExpanded={expandedSection === 'other'}
        onToggle={() => toggleSection('other')}
        hasData={otherCostData.length > 0}
      >
        <OtherCostSection 
          farmId={farmId} 
          batchId={batchId} 
          initialData={otherCostData}
        />
      </CostSection>
    </div>
  );
}

interface CostSectionProps {
  id: string;
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  hasData: boolean;
  isReadOnly?: boolean;
  children: React.ReactNode;
}

function CostSection({ id, title, icon, isExpanded, onToggle, hasData, isReadOnly = false, children }: CostSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
          {hasData && !isReadOnly && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Entered ✓</span>}
          {isReadOnly && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Auto-synced ✓</span>}
        </div>
        <div className="flex items-center gap-2">
          {hasData && !isReadOnly && (
            <span
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                // Edit is handled within the child component
              }}
            >
              <PencilSimple size={16} />
            </span>
          )}
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
