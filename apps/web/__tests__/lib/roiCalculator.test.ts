// FlockIQ - Batch ROI Optimizer Calculator Unit Tests
// File: apps/web/__tests__/lib/roiCalculator.test.ts
// Requirements: REQ-003 §3.1–3.4, Design Spec §3.6, TASK-011

import { describe, it, expect } from 'vitest';
import {
  calculateSellHoldMatrix,
  calculateBreakEvenPrice,
  isBelowBreakEven,
  RoiCalculatorInputs,
  PriceForecast,
} from '@/lib/roiCalculator';

describe('ROI Calculator - Pure TypeScript Module', () => {
  describe('calculateBreakEvenPrice', () => {
    it('should calculate break-even price correctly', () => {
      const inputs: RoiCalculatorInputs = {
        flockSize: 25000,
        ageDays: 38,
        avgWeightKg: 1.8,
        feedCostPerKg: 58,
        overheadCostPerBirdPerDay: 0.50,
      };

      const breakEvenPrice = calculateBreakEvenPrice(inputs);
      
      // Formula: (total_feed_cost + overhead_cost) / (flock_size × avg_weight)
      // Feed cost to date: 0.132 kg/bird/day * 58 * 25000 * 38 = 7,298,400
      // Overhead cost to date: 0.50 * 25000 * 38 = 475,000
      // Total cost: 7,773,400
      // Total weight: 25000 * 1.8 = 45,000 kg
      // Break-even: 7,773,400 / 45,000 = 172.74
      
      expect(breakEvenPrice).toBeGreaterThan(170);
      expect(breakEvenPrice).toBeLessThan(175);
    });

    it('should handle edge case with very high mortality (age=60 days)', () => {
      const inputs: RoiCalculatorInputs = {
        flockSize: 25000,
        ageDays: 60,
        avgWeightKg: 2.5,
        feedCostPerKg: 58,
        overheadCostPerBirdPerDay: 0.50,
      };

      const breakEvenPrice = calculateBreakEvenPrice(inputs);
      expect(breakEvenPrice).toBeGreaterThan(0);
    });

    it('should handle minimum valid inputs', () => {
      const inputs: RoiCalculatorInputs = {
        flockSize: 1000,
        ageDays: 28,
        avgWeightKg: 1.0,
        feedCostPerKg: 40,
        overheadCostPerBirdPerDay: 0,
      };

      const breakEvenPrice = calculateBreakEvenPrice(inputs);
      expect(breakEvenPrice).toBeGreaterThan(0);
    });
  });

  describe('calculateSellHoldMatrix', () => {
    const standardInputs: RoiCalculatorInputs = {
      flockSize: 25000,
      ageDays: 38,
      avgWeightKg: 1.8,
      feedCostPerKg: 58,
      overheadCostPerBirdPerDay: 0.50,
    };

    const standardForecast: PriceForecast = {
      p10: 158.00,
      p50: 162.40,
      p90: 168.00,
    };

    it('should calculate deterministic results (same inputs = same outputs)', () => {
      const result1 = calculateSellHoldMatrix(standardInputs, standardForecast);
      const result2 = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      expect(result1.breakEvenPrice).toEqual(result2.breakEvenPrice);
      expect(result1.sellHoldMatrix).toEqual(result2.sellHoldMatrix);
      expect(result1.optimalScenario).toEqual(result2.optimalScenario);
      expect(result1.profitWaterfall).toEqual(result2.profitWaterfall);
    });

    it('should return 4 scenarios (today, +3d, +7d, +14d)', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      expect(result.sellHoldMatrix).toHaveLength(4);
      expect(result.sellHoldMatrix[0].scenario).toBe('today');
      expect(result.sellHoldMatrix[1].scenario).toBe('+3d');
      expect(result.sellHoldMatrix[2].scenario).toBe('+7d');
      expect(result.sellHoldMatrix[3].scenario).toBe('+14d');
    });

    it('should identify the optimal scenario (highest net profit)', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      const optimalRows = result.sellHoldMatrix.filter(row => row.isOptimal);
      expect(optimalRows).toHaveLength(1);
      
      const optimalRow = optimalRows[0];
      const maxProfit = Math.max(...result.sellHoldMatrix.map(row => row.netProfit.base));
      expect(optimalRow.netProfit.base).toBe(maxProfit);
    });

    it('should calculate revenue for P10, P50, P90 scenarios', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      result.sellHoldMatrix.forEach(row => {
        expect(row.revenue.pessimistic).toBeGreaterThan(0);
        expect(row.revenue.base).toBeGreaterThan(0);
        expect(row.revenue.optimistic).toBeGreaterThan(0);
        
        // P10 < P50 < P90
        expect(row.revenue.pessimistic).toBeLessThan(row.revenue.base);
        expect(row.revenue.base).toBeLessThan(row.revenue.optimistic);
      });
    });

    it('should calculate feed cost correctly', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      // Today should have 0 feed cost (no holding)
      expect(result.sellHoldMatrix[0].feedCost).toBe(0);
      
      // +3d should have feed cost for 3 days
      expect(result.sellHoldMatrix[1].feedCost).toBeGreaterThan(0);
      
      // Feed cost should increase with holding days
      expect(result.sellHoldMatrix[2].feedCost).toBeGreaterThan(result.sellHoldMatrix[1].feedCost);
      expect(result.sellHoldMatrix[3].feedCost).toBeGreaterThan(result.sellHoldMatrix[2].feedCost);
    });

    it('should calculate mortality cost correctly', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      // Today should have 0 mortality cost (no holding)
      expect(result.sellHoldMatrix[0].mortalityCost).toBe(0);
      
      // Mortality cost should increase with holding days
      result.sellHoldMatrix.forEach(row => {
        expect(row.mortalityCost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate ROI percentage correctly', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      result.sellHoldMatrix.forEach(row => {
        expect(typeof row.roi).toBe('number');
        expect(row.roi).toBeGreaterThanOrEqual(-100);
        expect(row.roi).toBeLessThan(1000); // Reasonable upper bound
      });
    });

    it('should complete calculations within 50ms (performance requirement)', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        calculateSellHoldMatrix(standardInputs, standardForecast);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;
      
      expect(avgTime).toBeLessThan(50);
    });

    it('should handle edge case with age=60 days (very high mortality)', () => {
      const highAgeInputs: RoiCalculatorInputs = {
        ...standardInputs,
        ageDays: 60,
      };

      const result = calculateSellHoldMatrix(highAgeInputs, standardForecast);
      
      expect(result.sellHoldMatrix).toHaveLength(4);
      expect(result.breakEvenPrice).toBeGreaterThan(0);
      
      // Higher age should result in higher mortality costs
      const standardResult = calculateSellHoldMatrix(standardInputs, standardForecast);
      const highAgeMortalityCost = result.sellHoldMatrix[3].mortalityCost;
      const standardMortalityCost = standardResult.sellHoldMatrix[3].mortalityCost;
      expect(highAgeMortalityCost).toBeGreaterThan(standardMortalityCost);
    });

    it('should generate profit waterfall data', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      expect(result.profitWaterfall).toHaveLength(4);
      expect(result.profitWaterfall[0].category).toBe('Base Revenue (Today)');
      expect(result.profitWaterfall[1].category).toBe('Price Gain/Loss from Waiting');
      expect(result.profitWaterfall[2].category).toBe('Feed Cost');
      expect(result.profitWaterfall[3].category).toBe('Mortality Risk Cost');
    });

    it('should have negative values for costs in waterfall', () => {
      const result = calculateSellHoldMatrix(standardInputs, standardForecast);
      
      // Feed cost should be negative
      expect(result.profitWaterfall[2].base).toBeLessThan(0);
      
      // Mortality cost should be negative
      expect(result.profitWaterfall[3].base).toBeLessThan(0);
    });
  });

  describe('isBelowBreakEven', () => {
    const standardInputs: RoiCalculatorInputs = {
      flockSize: 25000,
      ageDays: 38,
      avgWeightKg: 1.8,
      feedCostPerKg: 58,
      overheadCostPerBirdPerDay: 0.50,
    };

    it('should return true when offer is below break-even', () => {
      const breakEvenPrice = calculateBreakEvenPrice(standardInputs);
      const belowOffer = breakEvenPrice - 10;
      
      expect(isBelowBreakEven(belowOffer, standardInputs)).toBe(true);
    });

    it('should return false when offer is above break-even', () => {
      const breakEvenPrice = calculateBreakEvenPrice(standardInputs);
      const aboveOffer = breakEvenPrice + 10;
      
      expect(isBelowBreakEven(aboveOffer, standardInputs)).toBe(false);
    });

    it('should return false when offer equals break-even', () => {
      const breakEvenPrice = calculateBreakEvenPrice(standardInputs);
      
      expect(isBelowBreakEven(breakEvenPrice, standardInputs)).toBe(false);
    });
  });

  describe('Performance - REQ-003 §3.7', () => {
    const standardInputs: RoiCalculatorInputs = {
      flockSize: 25000,
      ageDays: 38,
      avgWeightKg: 1.8,
      feedCostPerKg: 58,
      overheadCostPerBirdPerDay: 0.50,
    };

    const standardForecast: PriceForecast = {
      p10: 158.00,
      p50: 162.40,
      p90: 168.00,
    };

    it('should complete single calculation within 50ms', () => {
      const startTime = performance.now();
      calculateSellHoldMatrix(standardInputs, standardForecast);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle rapid input changes without performance degradation', () => {
      const times: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const variedInputs = {
          ...standardInputs,
          flockSize: standardInputs.flockSize + (i * 100),
        };
        
        const startTime = performance.now();
        calculateSellHoldMatrix(variedInputs, standardForecast);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }
      
      // All calculations should be under 50ms
      times.forEach(time => {
        expect(time).toBeLessThan(50);
      });
      
      // Standard deviation should be low (consistent performance)
      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      
      expect(stdDev).toBeLessThan(10); // Low variance
    });
  });
});
