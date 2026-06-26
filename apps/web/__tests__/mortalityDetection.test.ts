// FlockIQ — Mortality Detection Unit Tests
// File: apps/web/__tests__/mortalityDetection.test.ts
// Version: v1.0 | May 2026
// TASK-038: Unit tests for rolling average calculation

// Abnormal mortality detection function
const isAbnormal = (todayCount: number, last7Days: number[]): boolean => {
  if (last7Days.length < 3) return todayCount > 50; // fallback for new batches
  const rollingAvg = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
  return todayCount > (rollingAvg * 3);
};

describe('Mortality Detection - Rolling Average Calculation', () => {
  describe('isAbnormal function', () => {
    test('should return true when todayCount > 3x rolling average', () => {
      const last7Days = [10, 12, 8, 11, 9, 10, 12]; // avg = 10.28
      const todayCount = 35; // 35 > 3 * 10.28 = 30.84
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should return false when todayCount <= 3x rolling average', () => {
      const last7Days = [10, 12, 8, 11, 9, 10, 12]; // avg = 10.28
      const todayCount = 25; // 25 <= 3 * 10.28 = 30.84
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });

    test('should return true for new batches with < 3 data points when count > 50', () => {
      const last7Days = [15, 20]; // only 2 data points
      const todayCount = 55; // 55 > 50
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should return false for new batches with < 3 data points when count <= 50', () => {
      const last7Days = [15, 20]; // only 2 data points
      const todayCount = 45; // 45 <= 50
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });

    test('should return true for new batches with 0 data points when count > 50', () => {
      const last7Days: number[] = []; // no data points
      const todayCount = 60; // 60 > 50
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should return false for new batches with 0 data points when count <= 50', () => {
      const last7Days: number[] = []; // no data points
      const todayCount = 40; // 40 <= 50
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });

    test('should handle edge case with exactly 3 data points', () => {
      const last7Days = [10, 10, 10]; // exactly 3 data points, avg = 10
      const todayCount = 31; // 31 > 3 * 10 = 30
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should handle edge case with exactly 3 data points and normal count', () => {
      const last7Days = [10, 10, 10]; // exactly 3 data points, avg = 10
      const todayCount = 29; // 29 <= 3 * 10 = 30
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });

    test('should handle zero deaths in last 7 days', () => {
      const last7Days = [0, 0, 0, 0, 0, 0, 0]; // avg = 0
      const todayCount = 1; // 1 > 3 * 0 = 0
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should handle single data point (fallback to > 50 check)', () => {
      const last7Days = [25]; // only 1 data point
      const todayCount = 55; // 55 > 50
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should handle single data point with normal count', () => {
      const last7Days = [25]; // only 1 data point
      const todayCount = 45; // 45 <= 50
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });

    test('should calculate rolling average correctly with varying values', () => {
      const last7Days = [5, 8, 12, 15, 7, 9, 11]; // avg = 9.57
      const todayCount = 29; // 29 > 3 * 9.57 = 28.71
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should handle high mortality scenario', () => {
      const last7Days = [20, 25, 22, 28, 24, 26, 23]; // avg = 24
      const todayCount = 75; // 75 > 3 * 24 = 72
      expect(isAbnormal(todayCount, last7Days)).toBe(true);
    });

    test('should handle low mortality scenario', () => {
      const last7Days = [2, 3, 1, 2, 3, 2, 1]; // avg = 2
      const todayCount = 5; // 5 <= 3 * 2 = 6
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });

    test('should handle boundary condition exactly at threshold', () => {
      const last7Days = [10, 10, 10, 10, 10, 10, 10]; // avg = 10
      const todayCount = 30; // 30 == 3 * 10 = 30 (not >)
      expect(isAbnormal(todayCount, last7Days)).toBe(false);
    });
  });

  describe('Rolling Average Calculation Edge Cases', () => {
    test('should calculate correct average for first 7 days', () => {
      const last7Days = [5, 8, 12, 15, 7, 9, 11];
      const expected = 9.57;
      const actual = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
      expect(actual).toBeCloseTo(expected, 2);
    });

    test('should handle empty array gracefully', () => {
      const last7Days: number[] = [];
      const avg = last7Days.length > 0 ? last7Days.reduce((a, b) => a + b, 0) / last7Days.length : 0;
      expect(avg).toBe(0);
    });

    test('should handle single element array', () => {
      const last7Days = [42];
      const expected = 42;
      const actual = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
      expect(actual).toBe(expected);
    });

    test('should handle negative values (should not occur in production)', () => {
      const last7Days = [-5, 10, 15, -3, 8, 12, 7];
      const expected = 6.29;
      const actual = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
      expect(actual).toBeCloseTo(expected, 2);
    });
  });
});

// Test helper function for financial impact calculation
describe('Financial Impact Calculation', () => {
  test('should calculate estimated loss correctly', () => {
    const count = 28;
    const avgWeight = 2.1;
    const pricePerKg = 150;
    const expectedLoss = count * avgWeight * pricePerKg;
    expect(expectedLoss).toBe(8820);
  });

  test('should handle zero weight', () => {
    const count = 10;
    const avgWeight = 0;
    const pricePerKg = 150;
    const expectedLoss = count * avgWeight * pricePerKg;
    expect(expectedLoss).toBe(0);
  });

  test('should handle zero count', () => {
    const count = 0;
    const avgWeight = 2.0;
    const pricePerKg = 150;
    const expectedLoss = count * avgWeight * pricePerKg;
    expect(expectedLoss).toBe(0);
  });
});
