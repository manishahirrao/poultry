// Risk calculation utility functions for farm risk scoring
// Based on TASK-GAP6-API-001 specifications

// Haversine distance formula (returns km)
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) *
            Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Proximity score based on distance from outbreak epicentre
export function proximityScore(km: number): number {
  if (km < 20) return 4;
  if (km < 50) return 3;
  if (km < 100) return 2;
  if (km < 200) return 1;
  return 0;
}

// Age score from batch current_day
export function ageScore(day: number | null | undefined): number {
  if (!day) return 0;
  if (day <= 7) return 2;
  if (day <= 21) return 1.5;
  if (day <= 35) return 1;
  return 0.5;
}

// Vaccination score from vaccination records
// Check if ND (Newcastle) vaccine is marked as Done
export function vaccinationScore(vaccinations: any[]): number {
  if (!vaccinations || vaccinations.length === 0) return 2;
  
  const ndVacc = vaccinations.filter((v: any) => 
    v.vaccine_name && v.vaccine_name.toLowerCase().includes('newcastle')
  );
  
  if (!ndVacc.length) return 2;
  
  const allDone = ndVacc.every((v: any) => v.status === 'done');
  if (allDone) return 0;
  return 1;
}

// Biosecurity score from farm.biosecurity_level
export function biosecurityScore(level: string | null | undefined): number {
  if (!level) return 1; // Default to medium if not set
  return level === 'high' ? 0 : level === 'medium' ? 1 : 2;
}

// Risk level classification
export function riskLevel(total: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (total < 4) return 'LOW';
  if (total < 8) return 'MEDIUM';
  return 'HIGH';
}

// Calculate current day for a batch
export function calculateCurrentDay(placementDate: string | Date): number {
  const placement = new Date(placementDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - placement.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calculate complete risk score for a farm-alert pair
export interface RiskScoreInput {
  farmLat: number;
  farmLng: number;
  alertLat: number;
  alertLng: number;
  batchDay: number | null;
  vaccinations: any[];
  biosecurityLevel: string | null;
}

export interface RiskScoreOutput {
  proximity_km: number;
  proximity_score: number;
  age_score: number;
  vaccination_score: number;
  biosecurity_score: number;
  total_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function calculateRiskScore(input: RiskScoreInput): RiskScoreOutput {
  const proximity_km = haversineKm(
    input.farmLat, 
    input.farmLng, 
    input.alertLat, 
    input.alertLng
  );
  
  const proximity_score = proximityScore(proximity_km);
  const age_score = ageScore(input.batchDay);
  const vaccination_score = vaccinationScore(input.vaccinations);
  const biosecurity_score = biosecurityScore(input.biosecurityLevel);
  
  const total_score = proximity_score + age_score + vaccination_score + biosecurity_score;
  const risk_level = riskLevel(total_score);
  
  return {
    proximity_km: Math.round(proximity_km * 100) / 100, // Round to 2 decimal places
    proximity_score,
    age_score,
    vaccination_score,
    biosecurity_score,
    total_score: Math.round(total_score * 100) / 100,
    risk_level,
  };
}
