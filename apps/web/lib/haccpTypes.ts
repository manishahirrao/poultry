export interface CriticalControlPoint {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  measurableLimits: MeasurableLimit[];
  correctiveActions: string[];
  correctiveActionsHindi: string[];
}

export interface MeasurableLimit {
  id: string;
  parameter: string;
  parameterHindi: string;
  unit: string;
  minLimit?: number;
  maxLimit?: number;
  criticalLimit: number;
  monitoringFrequency: string;
  monitoringMethod: string;
}

export interface HACCPChecklistItem {
  ccpId: string;
  status: 'compliant' | 'deviation' | 'not_monitored';
  readings: Record<string, number>;
  timestamp: string;
  supervisorId: string;
  supervisorName: string;
  notes?: string;
}

export interface HACCPDeviation {
  id: string;
  ccpId: string;
  ccpName: string;
  parameter: string;
  actualValue: number;
  limitValue: number;
  deviationType: 'minor' | 'major' | 'critical';
  timestamp: string;
  supervisorId: string;
  supervisorName: string;
  correctiveAction: string;
  correctiveActionHindi: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  batchId?: string;
  processingRunId: string;
}

export interface HACCPAuditReport {
  processingRunId: string;
  batchId?: string;
  processingDate: string;
  facilityName: string;
  facilityAddress: string;
  fssaiLicenseNumber: string;
  checklistItems: HACCPChecklistItem[];
  deviations: HACCPDeviation[];
  overallStatus: 'compliant' | 'non_compliant' | 'partial_compliance';
  auditorName: string;
  auditorId: string;
  auditDate: string;
  signature?: string;
}

export const HACCP_CRITICAL_CONTROL_POINTS: CriticalControlPoint[] = [
  {
    id: 'ccp-1',
    name: 'Live Bird Receiving',
    nameHindi: 'जीवित पक्षी प्राप्ति',
    description: 'Receiving and inspection of live birds from farms',
    measurableLimits: [
      {
        id: 'limit-1-1',
        parameter: 'Body Temperature',
        parameterHindi: 'शरीर का तापमान',
        unit: '°C',
        maxLimit: 42,
        criticalLimit: 43,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Infrared thermometer'
      },
      {
        id: 'limit-1-2',
        parameter: 'Transport Time',
        parameterHindi: 'परिवहन समय',
        unit: 'hours',
        maxLimit: 3,
        criticalLimit: 4,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Transport log'
      },
      {
        id: 'limit-1-3',
        parameter: 'Mortality Rate',
        parameterHindi: 'मृत्यु दर',
        unit: '%',
        maxLimit: 0.5,
        criticalLimit: 1,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Count check'
      }
    ],
    correctiveActions: [
      'Reject batch if mortality > 1%',
      'Isolate affected birds for veterinary inspection',
      'Sanitize transport vehicle',
      'Document supplier for review'
    ],
    correctiveActionsHindi: [
      'मृत्यु दर > 1% होने पर बैच अस्वीकार करें',
      'पशु चिकित्सा जांच के लिए प्रभावित पक्षियों को अलग करें',
      'परिवहन वाहन को सैनिटाइज़ करें',
      'समीक्षा के लिए आपूर्तिकर्ता को दस्तावेज़ करें'
    ]
  },
  {
    id: 'ccp-2',
    name: 'Slaughter',
    nameHindi: 'वध',
    description: 'Slaughter process and stunning verification',
    measurableLimits: [
      {
        id: 'limit-2-1',
        parameter: 'Stunning Effectiveness',
        parameterHindi: 'स्टनिंग प्रभावकारिता',
        unit: '%',
        minLimit: 95,
        criticalLimit: 90,
        monitoringFrequency: 'Continuous',
        monitoringMethod: 'Visual inspection'
      },
      {
        id: 'limit-2-2',
        parameter: 'Bleeding Time',
        parameterHindi: 'रक्तस्राव समय',
        unit: 'seconds',
        minLimit: 90,
        criticalLimit: 60,
        monitoringFrequency: 'Per bird',
        monitoringMethod: 'Timer'
      },
      {
        id: 'limit-2-3',
        parameter: 'Knife Sanitization Interval',
        parameterHindi: 'चाकू सैनिटाइज़ेशन अंतराल',
        unit: 'birds',
        maxLimit: 500,
        criticalLimit: 1000,
        monitoringFrequency: 'Every 100 birds',
        monitoringMethod: 'Counter'
      }
    ],
    correctiveActions: [
      'Restun if ineffective stunning detected',
      'Extend bleeding time for incomplete bleed',
      'Immediately sanitize knife if interval exceeded',
      'Retrain slaughter personnel'
    ],
    correctiveActionsHindi: [
      'अप्रभावी स्टनिंग का पता चलने पर पुनः स्टन करें',
      'अपूर्ण रक्तस्राव के लिए रक्तस्राव समय बढ़ाएं',
      'अंतराल पार होने पर तुरंत चाकू सैनिटाइज़ करें',
      'वध कर्मचारियों को पुनः प्रशिक्षित करें'
    ]
  },
  {
    id: 'ccp-3',
    name: 'Evisceration',
    nameHindi: 'अंतःक्षेपण',
    description: 'Removal of internal organs and contamination prevention',
    measurableLimits: [
      {
        id: 'limit-3-1',
        parameter: 'Viscera Rupture Rate',
        parameterHindi: 'आंत्र फटने की दर',
        unit: '%',
        maxLimit: 2,
        criticalLimit: 5,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Visual inspection'
      },
      {
        id: 'limit-3-2',
        parameter: 'Water Temperature',
        parameterHindi: 'पानी का तापमान',
        unit: '°C',
        minLimit: 10,
        maxLimit: 15,
        criticalLimit: 20,
        monitoringFrequency: 'Continuous',
        monitoringMethod: 'Thermometer'
      },
      {
        id: 'limit-3-3',
        parameter: 'Contamination Rate',
        parameterHindi: 'दूषण दर',
        unit: '%',
        maxLimit: 1,
        criticalLimit: 3,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Visual inspection'
      }
    ],
    correctiveActions: [
      'Remove contaminated carcasses immediately',
      'Adjust water temperature if out of range',
      'Slow line speed if rupture rate high',
      'Sanitize equipment after contamination'
    ],
    correctiveActionsHindi: [
      'दूषित कार्कस को तुरंत हटा दें',
      'तापमान सीमा से बाहर होने पर पानी का तापमान समायोजित करें',
      'फटने की दर अधिक होने पर लाइन की गति धीमी करें',
      'दूषण के बाद उपकरण को सैनिटाइज़ करें'
    ]
  },
  {
    id: 'ccp-4',
    name: 'Chilling',
    nameHindi: 'शीतलन',
    description: 'Post-slaughter chilling process',
    measurableLimits: [
      {
        id: 'limit-4-1',
        parameter: 'Chilling Temperature',
        parameterHindi: 'शीतलन तापमान',
        unit: '°C',
        maxLimit: 4,
        criticalLimit: 7,
        monitoringFrequency: 'Every 30 minutes',
        monitoringMethod: 'Digital thermometer'
      },
      {
        id: 'limit-4-2',
        parameter: 'Chilling Time',
        parameterHindi: 'शीतलन समय',
        unit: 'hours',
        minLimit: 2,
        maxLimit: 4,
        criticalLimit: 6,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Timer'
      },
      {
        id: 'limit-4-3',
        parameter: 'Water pH',
        parameterHindi: 'पानी pH',
        unit: '',
        minLimit: 6.5,
        maxLimit: 8.5,
        criticalLimit: 9,
        monitoringFrequency: 'Every hour',
        monitoringMethod: 'pH meter'
      }
    ],
    correctiveActions: [
      'Increase chilling capacity if temperature high',
      'Extend chilling time if not reached target',
      'Adjust water pH if out of range',
      'Reject batch if critical limit exceeded'
    ],
    correctiveActionsHindi: [
      'तापमान अधिक होने पर शीतलन क्षमता बढ़ाएं',
      'लक्ष्य तक नहीं पहुंचने पर शीतलन समय बढ़ाएं',
      'सीमा से बाहर होने पर पानी का pH समायोजित करें',
      'क्रिटिकल सीमा पार होने पर बैच अस्वीकार करें'
    ]
  },
  {
    id: 'ccp-5',
    name: 'Cutting',
    nameHindi: 'काटना',
    description: 'Cutting and portioning operations',
    measurableLimits: [
      {
        id: 'limit-5-1',
        parameter: 'Room Temperature',
        parameterHindi: 'कमरे का तापमान',
        unit: '°C',
        maxLimit: 12,
        criticalLimit: 15,
        monitoringFrequency: 'Every hour',
        monitoringMethod: 'Digital thermometer'
      },
      {
        id: 'limit-5-2',
        parameter: 'Product Temperature',
        parameterHindi: 'उत्पाद तापमान',
        unit: '°C',
        maxLimit: 4,
        criticalLimit: 7,
        monitoringFrequency: 'Every 30 minutes',
        monitoringMethod: 'Probe thermometer'
      },
      {
        id: 'limit-5-3',
        parameter: 'Knife Sanitization Interval',
        parameterHindi: 'चाकू सैनिटाइज़ेशन अंतराल',
        unit: 'minutes',
        maxLimit: 30,
        criticalLimit: 60,
        monitoringFrequency: 'Continuous',
        monitoringMethod: 'Timer'
      }
    ],
    correctiveActions: [
      'Reduce room temperature if high',
      'Stop cutting if product temperature rises',
      'Immediately sanitize knives at interval',
      'Hold product if temperature limits exceeded'
    ],
    correctiveActionsHindi: [
      'तापमान अधिक होने पर कमरे का तापमान कम करें',
      'उत्पाद तापमान बढ़ने पर काटना बंद करें',
      'अंतराल पर तुरंत चाकू सैनिटाइज़ करें',
      'तापमान सीमा पार होने पर उत्पाद रोकें'
    ]
  },
  {
    id: 'ccp-6',
    name: 'Packaging',
    nameHindi: 'पैकेजिंग',
    description: 'Packaging and labeling operations',
    measurableLimits: [
      {
        id: 'limit-6-1',
        parameter: 'Package Integrity',
        parameterHindi: 'पैकेज अखंडता',
        unit: '%',
        minLimit: 99,
        criticalLimit: 95,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Visual inspection'
      },
      {
        id: 'limit-6-2',
        parameter: 'Label Accuracy',
        parameterHindi: 'लेबल सटीकता',
        unit: '%',
        minLimit: 100,
        criticalLimit: 98,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Label verification'
      },
      {
        id: 'limit-6-3',
        parameter: 'Date Code Accuracy',
        parameterHindi: 'दिनांक कोड सटीकता',
        unit: '%',
        minLimit: 100,
        criticalLimit: 99,
        monitoringFrequency: 'Per batch',
        monitoringMethod: 'Date code verification'
      }
    ],
    correctiveActions: [
      'Reject defective packages immediately',
      'Correct labeling errors before shipment',
      'Reprint date codes if incorrect',
      'Retrain packaging staff'
    ],
    correctiveActionsHindi: [
      'दोषपूर्ण पैकेज को तुरंत अस्वीकार करें',
      'शिपमेंट से पहले लेबलिंग त्रुटियों को सुधारें',
      'गलत होने पर दिनांक कोड पुनः प्रिंट करें',
      'पैकेजिंग स्टाफ को पुनः प्रशिक्षित करें'
    ]
  },
  {
    id: 'ccp-7',
    name: 'Cold Storage',
    nameHindi: 'शीत भंडारण',
    description: 'Cold storage and temperature monitoring',
    measurableLimits: [
      {
        id: 'limit-7-1',
        parameter: 'Storage Temperature',
        parameterHindi: 'भंडारण तापमान',
        unit: '°C',
        maxLimit: -18,
        criticalLimit: -12,
        monitoringFrequency: 'Every 4 hours',
        monitoringMethod: 'Digital logger'
      },
      {
        id: 'limit-7-2',
        parameter: 'Temperature Fluctuation',
        parameterHindi: 'तापमान उतार-चढ़ाव',
        unit: '°C',
        maxLimit: 2,
        criticalLimit: 4,
        monitoringFrequency: 'Continuous',
        monitoringMethod: 'Temperature logger'
      },
      {
        id: 'limit-7-3',
        parameter: 'Humidity',
        parameterHindi: 'नमी',
        unit: '%',
        minLimit: 85,
        maxLimit: 95,
        criticalLimit: 98,
        monitoringFrequency: 'Every 8 hours',
        monitoringMethod: 'Hygrometer'
      }
    ],
    correctiveActions: [
      'Check refrigeration system if temperature high',
      'Reduce door opening time',
      'Adjust humidity controls',
      'Transfer product if critical limit exceeded'
    ],
    correctiveActionsHindi: [
      'तापमान अधिक होने पर रेफ्रिजरेशन सिस्टम की जांच करें',
      'दरवाजा खोलने का समय कम करें',
      'नमी नियंत्रण समायोजित करें',
      'क्रिटिकल सीमा पार होने पर उत्पाद स्थानांतरित करें'
    ]
  },
  {
    id: 'ccp-8',
    name: 'Dispatch',
    nameHindi: 'प्रेषण',
    description: 'Final dispatch and transportation',
    measurableLimits: [
      {
        id: 'limit-8-1',
        parameter: 'Dispatch Temperature',
        parameterHindi: 'प्रेषण तापमान',
        unit: '°C',
        maxLimit: -18,
        criticalLimit: -12,
        monitoringFrequency: 'Per shipment',
        monitoringMethod: 'Probe thermometer'
      },
      {
        id: 'limit-8-2',
        parameter: 'Vehicle Temperature',
        parameterHindi: 'वाहन तापमान',
        unit: '°C',
        maxLimit: -18,
        criticalLimit: -12,
        monitoringFrequency: 'Continuous during transit',
        monitoringMethod: 'Temperature logger'
      },
      {
        id: 'limit-8-3',
        parameter: 'Delivery Time',
        parameterHindi: 'डिलीवरी समय',
        unit: 'hours',
        maxLimit: 24,
        criticalLimit: 36,
        monitoringFrequency: 'Per shipment',
        monitoringMethod: 'GPS tracking'
      }
    ],
    correctiveActions: [
      'Reject shipment if temperature high at dispatch',
      'Use refrigerated vehicle if available',
      'Expedite delivery if time critical',
      'Document temperature deviations for receiver'
    ],
    correctiveActionsHindi: [
      'प्रेषण पर तापमान अधिक होने पर शिपमेंट अस्वीकार करें',
      'उपलब्ध होने पर रेफ्रिजरेटेड वाहन का उपयोग करें',
      'समय क्रिटिकल होने पर डिलीवरी तेज करें',
      'रिसीवर के लिए तापमान विचलन दस्तावेज़ करें'
    ]
  }
];

export function getCCPById(id: string): CriticalControlPoint | undefined {
  return HACCP_CRITICAL_CONTROL_POINTS.find(ccp => ccp.id === id);
}

export function getAllCCPs(): CriticalControlPoint[] {
  return HACCP_CRITICAL_CONTROL_POINTS;
}

export function checkLimitCompliance(
  value: number,
  limit: MeasurableLimit
): { compliant: boolean; deviationType: 'minor' | 'major' | 'critical' | 'none' } {
  const { minLimit, maxLimit, criticalLimit } = limit;
  
  if (minLimit !== undefined && value < minLimit) {
    if (value < criticalLimit) {
      return { compliant: false, deviationType: 'critical' };
    }
    return { compliant: false, deviationType: 'major' };
  }
  
  if (maxLimit !== undefined && value > maxLimit) {
    if (value > criticalLimit) {
      return { compliant: false, deviationType: 'critical' };
    }
    return { compliant: false, deviationType: 'major' };
  }
  
  return { compliant: true, deviationType: 'none' };
}
