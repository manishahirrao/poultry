// FlockIQ - FCR Calculator Unit Tests
// Requirements: REQ-014 §14.10, TASK-032

import { describe, it, expect } from 'vitest';
import {
  calculateFCR,
  calculateTotalWeightGain,
  calculateFCRWithStandard,
  calculateFCRFromLogs,
  checkFeedWaterRatio,
  getBreedStandardFCR,
  getDocWeightKg,
  calculateFeedAllocation,
  forecastFCR,
} from '@/lib/fcrCalculator';

describe('FCR Calculator', () => {
  describe('calculateFCR', () => {
    it('should calculate FCR correctly for valid inputs', () => {
      const totalFeedKg = 1000;
      const totalWeightGainKg = 500;
      const result = calculateFCR(totalFeedKg, totalWeightGainKg);
      expect(result).toBe(2.0);
    });

    it('should return 0 when weight gain is 0 or negative', () => {
      expect(calculateFCR(1000, 0)).toBe(0);
      expect(calculateFCR(1000, -100)).toBe(0);
    });

    it('should handle decimal values correctly', () => {
      expect(calculateFCR(1500.5, 750.25)).toBeCloseTo(2.0, 2);
    });
  });

  describe('calculateTotalWeightGain', () => {
    it('should calculate total weight gain correctly', () => {
      const currentAvgWeightKg = 2.0;
      const docWeightKg = 0.042;
      const currentBirdCount = 25000;
      const result = calculateTotalWeightGain(currentAvgWeightKg, docWeightKg, currentBirdCount);
      expect(result).toBe(48950); // (2.0 - 0.042) * 25000 = 1.958 * 25000 = 48950
    });

    it('should handle zero bird count', () => {
      const result = calculateTotalWeightGain(2.0, 0.042, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateFCRWithStandard', () => {
    it('should return green status when FCR is below breed standard', () => {
      const result = calculateFCRWithStandard(1000, 2.0, 0.042, 25000, 1.75);
      expect(result.fcr).toBeCloseTo(2.0, 2);
      expect(result.colorStatus).toBe('green');
      expect(result.deviationFromStandard).toBeCloseTo(0.25, 2);
    });

    it('should return amber status when FCR is within 0.3 of breed standard', () => {
      const result = calculateFCRWithStandard(1000, 2.0, 0.042, 25000, 1.85);
      expect(result.fcr).toBeCloseTo(2.0, 2);
      expect(result.colorStatus).toBe('amber');
    });

    it('should return red status when FCR is above breed standard + 0.3', () => {
      const result = calculateFCRWithStandard(1000, 2.0, 0.042, 25000, 1.65);
      expect(result.fcr).toBeCloseTo(2.0, 2);
      expect(result.colorStatus).toBe('red');
    });
  });

  describe('calculateFCRFromLogs', () => {
    it('should calculate FCR from feed logs and weight logs', () => {
      const feedLogs = [
        { date: '2026-06-16', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-17', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
      ];
      const weightLogs = [
        { date: '2026-06-17', avgWeightKg: 1.5, sampleSize: 30 },
      ];
      const result = calculateFCRFromLogs(feedLogs, weightLogs, 0.042, 25000, 1.75);
      expect(result).not.toBeNull();
      expect(result?.fcr).toBeGreaterThan(0);
    });

    it('should return null when feed logs are empty', () => {
      const result = calculateFCRFromLogs([], [], 0.042, 25000, 1.75);
      expect(result).toBeNull();
    });

    it('should return null when weight logs are empty', () => {
      const feedLogs = [
        { date: '2026-06-16', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
      ];
      const result = calculateFCRFromLogs(feedLogs, [], 0.042, 25000, 1.75);
      expect(result).toBeNull();
    });
  });

  describe('checkFeedWaterRatio', () => {
    it('should detect low water ratio (< 1.8)', () => {
      const result = checkFeedWaterRatio(160, 100); // 160/100 = 1.6
      expect(result.isDeviated).toBe(true);
      expect(result.ratio).toBe(1.6);
      expect(result.alertType).toBe('low');
    });

    it('should detect high water ratio (> 3.5)', () => {
      const result = checkFeedWaterRatio(380, 100); // 380/100 = 3.8
      expect(result.isDeviated).toBe(true);
      expect(result.ratio).toBe(3.8);
      expect(result.alertType).toBe('high');
    });

    it('should not flag normal water ratio (1.8 - 3.5)', () => {
      const result = checkFeedWaterRatio(220, 100); // 220/100 = 2.2
      expect(result.isDeviated).toBe(false);
      expect(result.ratio).toBe(2.2);
      expect(result.alertType).toBe('normal');
    });

    it('should handle edge case at lower boundary (1.8)', () => {
      const result = checkFeedWaterRatio(180, 100); // 180/100 = 1.8
      expect(result.isDeviated).toBe(false);
      expect(result.alertType).toBe('normal');
    });

    it('should handle edge case at upper boundary (3.5)', () => {
      const result = checkFeedWaterRatio(350, 100); // 350/100 = 3.5
      expect(result.isDeviated).toBe(false);
      expect(result.alertType).toBe('normal');
    });

    it('should return normal when feed is 0', () => {
      const result = checkFeedWaterRatio(100, 0);
      expect(result.isDeviated).toBe(false);
      expect(result.ratio).toBe(0);
      expect(result.alertType).toBe('normal');
    });

    it('should correctly identify ratio 1.6 as too low', () => {
      const result = checkFeedWaterRatio(160, 100);
      expect(result.isDeviated).toBe(true);
      expect(result.alertType).toBe('low');
    });

    it('should correctly identify ratio 3.8 as too high', () => {
      const result = checkFeedWaterRatio(380, 100);
      expect(result.isDeviated).toBe(true);
      expect(result.alertType).toBe('high');
    });

    it('should not flag ratio 2.2 as abnormal', () => {
      const result = checkFeedWaterRatio(220, 100);
      expect(result.isDeviated).toBe(false);
      expect(result.alertType).toBe('normal');
    });
  });

  describe('getBreedStandardFCR', () => {
    it('should return correct FCR for Cobb 500 at day 35', () => {
      const result = getBreedStandardFCR('Cobb 500', 35);
      expect(result).toBe(1.75);
    });

    it('should return correct FCR for Ross 308 at day 35', () => {
      const result = getBreedStandardFCR('Ross 308', 35);
      expect(result).toBe(1.70);
    });

    it('should return correct FCR for Vencobb at day 40', () => {
      const result = getBreedStandardFCR('Vencobb', 40);
      expect(result).toBe(1.90);
    });

    it('should return correct FCR for Hubbard at day 41', () => {
      const result = getBreedStandardFCR('Hubbard', 41);
      expect(result).toBe(1.88);
    });

    it('should interpolate between known ages', () => {
      const result = getBreedStandardFCR('Cobb 500', 31); // Between day 28 (1.65) and day 35 (1.75)
      expect(result).toBeGreaterThan(1.65);
      expect(result).toBeLessThan(1.75);
    });

    it('should use highest age for ages beyond known range', () => {
      const result = getBreedStandardFCR('Cobb 500', 50); // Beyond day 42
      expect(result).toBe(1.85);
    });

    it('should use lowest age for ages below known range', () => {
      const result = getBreedStandardFCR('Cobb 500', 20); // Below day 28
      expect(result).toBe(1.65);
    });

    it('should default to Cobb 500 for unknown breed', () => {
      const result = getBreedStandardFCR('Unknown Breed', 35);
      expect(result).toBe(1.75);
    });
  });

  describe('getDocWeightKg', () => {
    it('should return correct DOC weight for Cobb 500', () => {
      const result = getDocWeightKg('Cobb 500');
      expect(result).toBe(0.042);
    });

    it('should return correct DOC weight for Ross 308', () => {
      const result = getDocWeightKg('Ross 308');
      expect(result).toBe(0.043);
    });

    it('should return correct DOC weight for Vencobb', () => {
      const result = getDocWeightKg('Vencobb');
      expect(result).toBe(0.040);
    });

    it('should return correct DOC weight for Hubbard', () => {
      const result = getDocWeightKg('Hubbard');
      expect(result).toBe(0.041);
    });

    it('should default to Cobb 500 for unknown breed', () => {
      const result = getDocWeightKg('Unknown Breed');
      expect(result).toBe(0.042);
    });
  });

  describe('calculateFeedAllocation', () => {
    it('should calculate correct recommendation for day 35 Cobb 500, 25,000 birds, FCR standard 1.9', () => {
      const result = calculateFeedAllocation('Cobb 500', 35, 25000);
      expect(result.totalFeedKg).toBeGreaterThan(0);
      expect(result.morningFeedKg).toBe(result.eveningFeedKg); // 50/50 split
      expect(result.recommendedFCR).toBeCloseTo(1.75, 2); // Cobb 500 day 35 standard
      expect(result.flockSize).toBe(25000);
      expect(result.ageDays).toBe(35);
      expect(result.breed).toBe('Cobb 500');
    });

    it('should calculate recommendation for Ross 308 at day 35', () => {
      const result = calculateFeedAllocation('Ross 308', 35, 25000);
      expect(result.recommendedFCR).toBeCloseTo(1.70, 2); // Ross 308 day 35 standard
    });

    it('should calculate recommendation for Vencobb at day 40', () => {
      const result = calculateFeedAllocation('Vencobb', 40, 25000);
      expect(result.recommendedFCR).toBeCloseTo(1.90, 2); // Vencobb day 40 standard
    });

    it('should handle current weight parameter if provided', () => {
      const result = calculateFeedAllocation('Cobb 500', 35, 25000, 1.85);
      expect(result.totalFeedKg).toBeGreaterThan(0);
    });

    it('should split feed evenly between morning and evening', () => {
      const result = calculateFeedAllocation('Cobb 500', 35, 25000);
      expect(result.morningFeedKg).toBe(result.eveningFeedKg);
      expect(result.morningFeedKg + result.eveningFeedKg).toBe(result.totalFeedKg);
    });

    it('should include calculation basis in Hindi', () => {
      const result = calculateFeedAllocation('Cobb 500', 35, 25000);
      expect(result.calculationBasis).toContain('पक्षी');
      expect(result.calculationBasis).toContain('Day 35');
    });
  });

  describe('forecastFCR', () => {
    it('should return null when there is insufficient data', () => {
      const feedLogs = [
        { date: '2026-06-16', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
      ];
      const weightLogs = [
        { date: '2026-06-16', avgWeightKg: 1.5, sampleSize: 30 },
      ];
      const result = forecastFCR(feedLogs, weightLogs, 35, 42);
      expect(result).toBeNull();
    });

    it('should return null when feed logs are empty', () => {
      const weightLogs = [
        { date: '2026-06-16', avgWeightKg: 1.5, sampleSize: 30 },
        { date: '2026-06-17', avgWeightKg: 1.6, sampleSize: 30 },
        { date: '2026-06-18', avgWeightKg: 1.7, sampleSize: 30 },
      ];
      const result = forecastFCR([], weightLogs, 35, 42);
      expect(result).toBeNull();
    });

    it('should return null when weight logs are empty', () => {
      const feedLogs = [
        { date: '2026-06-16', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-17', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-18', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
      ];
      const result = forecastFCR(feedLogs, [], 35, 42);
      expect(result).toBeNull();
    });

    it('should calculate forecast with sufficient data', () => {
      const feedLogs = [
        { date: '2026-06-16', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-17', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-18', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
      ];
      const weightLogs = [
        { date: '2026-06-16', avgWeightKg: 1.5, sampleSize: 30 },
        { date: '2026-06-17', avgWeightKg: 1.6, sampleSize: 30 },
        { date: '2026-06-18', avgWeightKg: 1.7, sampleSize: 30 },
      ];
      const result = forecastFCR(feedLogs, weightLogs, 35, 42);
      expect(result).not.toBeNull();
      expect(result?.forecastFCR).toBeGreaterThan(0);
      expect(result?.confidence).toBeGreaterThanOrEqual(0);
      expect(result?.confidence).toBeLessThanOrEqual(1);
      expect(result?.trend).toMatch(/^(improving|stable|deteriorating)$/);
      expect(result?.projectionData).toBeDefined();
      expect(result?.projectionData.length).toBeGreaterThan(0);
    });

    it('should generate projection data for remaining days', () => {
      const feedLogs = [
        { date: '2026-06-16', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-17', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
        { date: '2026-06-18', morningFeedKg: 500, eveningFeedKg: 500, waterLitres: 1000, feedBrand: 'Godrej', feedRefusalKg: 0 },
      ];
      const weightLogs = [
        { date: '2026-06-16', avgWeightKg: 1.5, sampleSize: 30 },
        { date: '2026-06-17', avgWeightKg: 1.6, sampleSize: 30 },
        { date: '2026-06-18', avgWeightKg: 1.7, sampleSize: 30 },
      ];
      const result = forecastFCR(feedLogs, weightLogs, 35, 42);
      expect(result?.projectionData).toBeDefined();
      expect(result?.projectionData.length).toBe(42 - 35); // 7 days of projection
    });
  });
});
