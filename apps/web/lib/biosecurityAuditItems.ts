/**
 * FlockIQ - Biosecurity Audit Items
 * TASK-037: Biosecurity Audit Form & Score Tracker
 * Requirement Refs: REQ-017 §17.1, Design Addendum §15.1
 * 
 * This module provides the biosecurity audit checklist items and scoring logic
 * for tracking farm biosecurity compliance.
 * 
 * Features:
 * - 11-point biosecurity audit checklist
 * - Hindi translations for field worker accessibility
 * - Equal-weight scoring system
 * - Score calculation with color-coded status
 * - Score label classification (Excellent, Acceptable, Needs Improvement, Critical Risk)
 */

/**
 * Biosecurity audit item structure
 * Each item has English and Hindi labels, descriptions, and equal weight
 */
export interface BiosecurityAuditItem {
  id: string;
  label: string;
  labelHi: string; // Hindi translation
  description: string;
  descriptionHi: string; // Hindi description
  weight: number; // Weight for scoring (all items have equal weight in this implementation)
}

/**
 * 11-point biosecurity audit checklist
 * Covers all critical biosecurity aspects for poultry farms
 * Each item has equal weight in the scoring system
 */
export const biosecurityAuditItems: BiosecurityAuditItem[] = [
  {
    id: 'visitor_log',
    label: 'Visitor Log',
    labelHi: 'आगंतुक लॉग',
    description: 'All visitors are logged with name, purpose, and entry/exit time',
    descriptionHi: 'सभी आगंतुकों का नाम, उद्देश्य और प्रवेश/निकास समय दर्ज किया जाता है',
    weight: 1
  },
  {
    id: 'vehicle_entry',
    label: 'Vehicle Entry Log',
    labelHi: 'वाहन प्रवेश लॉग',
    description: 'All vehicles entering the farm are logged and disinfected',
    descriptionHi: 'फार्म में प्रवेश करने वाले सभी वाहनों को दर्ज किया जाता है और कीटाणुरहित किया जाता है',
    weight: 1
  },
  {
    id: 'footbath',
    label: 'Footbath Maintenance',
    labelHi: 'फुटबाथ रखरखाव',
    description: 'Footbaths at all entry points are properly maintained with fresh disinfectant',
    descriptionHi: 'सभी प्रवेश बिंदुओं पर फुटबाथ ताजे कीटाणुनाशक के साथ उचित रूप से बनाए रखे जाते हैं',
    weight: 1
  },
  {
    id: 'feed_store_hygiene',
    label: 'Feed Store Hygiene',
    labelHi: 'चारा भंडार स्वच्छता',
    description: 'Feed storage area is clean, dry, and protected from pests',
    descriptionHi: 'चारा भंडार क्षेत्र साफ, सूखा और कीटों से सुरक्षित है',
    weight: 1
  },
  {
    id: 'dead_bird_disposal',
    label: 'Dead Bird Disposal',
    labelHi: 'मृत पक्षी निपटान',
    description: 'Dead birds are disposed of properly using approved methods',
    descriptionHi: 'मृत पक्षियों को अनुमोदित विधियों का उपयोग करके उचित रूप से निपटाया जाता है',
    weight: 1
  },
  {
    id: 'equipment_sanitation',
    label: 'Equipment Sanitation',
    labelHi: 'उपकरण स्वच्छता',
    description: 'All equipment is cleaned and sanitized regularly',
    descriptionHi: 'सभी उपकरणों को नियमित रूप से साफ और कीटाणुरहित किया जाता है',
    weight: 1
  },
  {
    id: 'rodent_control',
    label: 'Rodent Control',
    labelHi: 'चूहा नियंत्रण',
    description: 'Rodent control measures are in place and regularly monitored',
    descriptionHi: 'चूहा नियंत्रण उपाय लागू हैं और नियमित रूप से निगरानी की जाती है',
    weight: 1
  },
  {
    id: 'flock_isolation',
    label: 'Flock Isolation',
    labelHi: 'झुंड पृथक्करण',
    description: 'Different age groups are kept isolated to prevent disease spread',
    descriptionHi: 'रोग फैलने को रोकने के लिए विभिन्न आयु समूहों को अलग रखा जाता है',
    weight: 1
  },
  {
    id: 'worker_ppe',
    label: 'Worker PPE',
    labelHi: 'कर्मचारी PPE',
    description: 'Workers use appropriate Personal Protective Equipment (PPE)',
    descriptionHi: 'कर्मचारी उचित व्यक्तिगत सुरक्षा उपकरण (PPE) का उपयोग करते हैं',
    weight: 1
  },
  {
    id: 'vaccination_records',
    label: 'Vaccination Records Up to Date',
    labelHi: 'टीकाकरण रिकॉर्ड अद्यतन',
    description: 'All vaccination records are current and properly documented',
    descriptionHi: 'सभी टीकाकरण रिकॉर्ड वर्तमान और उचित रूप से दस्तावेजित हैं',
    weight: 1
  },
  {
    id: 'sick_bird_isolation',
    label: 'Sick Bird Isolation Protocol',
    labelHi: 'बीमार पक्षी पृथक्करण प्रोटोकॉल',
    description: 'Sick birds are identified and isolated promptly',
    descriptionHi: 'बीमार पक्षियों की पहचान की जाती है और उन्हें तुरंत अलग किया जाता है',
    weight: 1
  },
  {
    id: 'biosecurity_training',
    label: 'Biosecurity Training Up to Date',
    labelHi: 'बायोसिक्योरिटी प्रशिक्षण अद्यतन',
    description: 'All workers have completed biosecurity training',
    descriptionHi: 'सभी कर्मचारियों ने बायोसिक्योरिटी प्रशिक्षण पूरा कर लिया है',
    weight: 1
  }
];

/**
 * Biosecurity audit response options
 * - yes: Fully compliant (100% score for item)
 * - partial: Partially compliant (50% score for item)
 * - no: Not compliant (0% score for item)
 */
export type BiosecurityAuditResponse = 'yes' | 'partial' | 'no';

/**
 * Biosecurity audit submission structure
 * Contains all audit data including responses, calculated score, and metadata
 */
export interface BiosecurityAuditSubmission {
  batchId: string;
  auditDate: string;
  responses: Record<string, BiosecurityAuditResponse>;
  score: number; // Calculated score (0-100)
  notes?: string;
  loggedBy: string;
}

/**
 * Calculate biosecurity score from audit responses
 * Formula: (total_points / total_items) × 100
 * 
 * Scoring:
 * - 'yes' response: 1 point
 * - 'partial' response: 0.5 points
 * - 'no' response: 0 points
 * 
 * @param responses - Record of item IDs to response values
 * @returns Biosecurity score (0-100)
 */
export const calculateBiosecurityScore = (
  responses: Record<string, BiosecurityAuditResponse>
): number => {
  const totalItems = biosecurityAuditItems.length;
  let totalScore = 0;

  biosecurityAuditItems.forEach((item) => {
    const response = responses[item.id];
    if (response === 'yes') {
      totalScore += 1;
    } else if (response === 'partial') {
      totalScore += 0.5;
    }
    // 'no' contributes 0
  });

  return Math.round((totalScore / totalItems) * 100);
};

/**
 * Get color class for biosecurity score
 * Returns Tailwind color class based on score range
 * 
 * @param score - Biosecurity score (0-100)
 * @returns Tailwind text color class
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Get label for biosecurity score
 * Returns human-readable label based on score range
 * 
 * @param score - Biosecurity score (0-100)
 * @returns Score label (Excellent, Acceptable, Needs Improvement, Critical Risk)
 */
export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Acceptable';
  if (score >= 40) return 'Needs Improvement';
  return 'Critical Risk';
};
