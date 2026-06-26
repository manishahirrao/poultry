import { test, expect } from '@playwright/test';

/**
 * IoT Realtime Subscription Memory Leak Test
 * 
 * This test performs a 30-minute soak test to verify that IoT realtime subscriptions
 * do not cause memory leaks. It monitors memory usage over time while maintaining
 * an active Supabase Realtime subscription to iot_readings table.
 * 
 * Acceptance Criteria: TASK-057
 * - IoT realtime subscription does not cause memory leaks
 * - Confirmed via 30-minute soak test in browser profiler
 */

test.describe('IoT Realtime Memory Leak Test', () => {
  test('should not leak memory during 30-minute realtime subscription', async ({ page, context }) => {
    // Enable Chrome DevTools Protocol for memory profiling
    const client = await context.newCDPSession(page);
    
    // Navigate to a page with IoT realtime subscription
    await page.goto('http://localhost:3000/dashboard/batches');
    
    // Wait for page to load and initialize subscriptions
    await page.waitForLoadState('networkidle');
    
    // Enable memory tracking
    await client.send('HeapProfiler.enable');
    
    // Get initial memory snapshot
    const initialSnapshot = await client.send('HeapProfiler.takeHeapSnapshot');
    const initialMemory = await getMemoryUsage(client);
    console.log('Initial memory usage:', initialMemory);
    
    // Memory measurements over time
    const memoryMeasurements: number[] = [initialMemory];
    const measurementInterval = 60000; // 1 minute
    const totalDuration = 1800000; // 30 minutes
    
    // Start realtime subscription (simulated by staying on the page)
    // The page should have IoT realtime subscriptions active
    
    // Monitor memory over 30 minutes
    for (let elapsed = 0; elapsed < totalDuration; elapsed += measurementInterval) {
      // Simulate user activity to keep page alive
      await page.mouse.move(100, 100);
      await page.waitForTimeout(1000);
      
      // Take memory measurement
      const currentMemory = await getMemoryUsage(client);
      memoryMeasurements.push(currentMemory);
      
      console.log(`Memory at ${elapsed / 60000} minutes:`, currentMemory);
      
      // Check for significant memory growth (potential leak)
      const memoryGrowth = currentMemory - initialMemory;
      const growthPercentage = (memoryGrowth / initialMemory) * 100;
      
      // Warning threshold: 50% growth
      if (growthPercentage > 50) {
        console.warn(`⚠️ Memory growth warning: ${growthPercentage.toFixed(2)}% at ${elapsed / 60000} minutes`);
      }
      
      // Critical threshold: 100% growth
      if (growthPercentage > 100) {
        console.error(`❌ Critical memory growth: ${growthPercentage.toFixed(2)}% at ${elapsed / 60000} minutes`);
        // Take heap snapshot for analysis
        const leakSnapshot = await client.send('HeapProfiler.takeHeapSnapshot');
        console.log('Heap snapshot taken for leak analysis');
      }
      
      // Wait for next measurement interval
      await page.waitForTimeout(measurementInterval);
    }
    
    // Take final memory snapshot
    const finalSnapshot = await client.send('HeapProfiler.takeHeapSnapshot');
    const finalMemory = await getMemoryUsage(client);
    console.log('Final memory usage:', finalMemory);
    
    // Analyze memory trend
    const memoryTrend = analyzeMemoryTrend(memoryMeasurements);
    console.log('Memory trend analysis:', memoryTrend);
    
    // Assertions
    // Memory should not grow more than 100% over 30 minutes
    const totalGrowth = finalMemory - initialMemory;
    const totalGrowthPercentage = (totalGrowth / initialMemory) * 100;
    
    expect(totalGrowthPercentage).toBeLessThan(100);
    
    // Memory should stabilize (not continuously grow)
    expect(memoryTrend.isLeaking).toBe(false);
    
    // Disable heap profiler
    await client.send('HeapProfiler.disable');
  });
  
  test('should cleanup subscriptions on page navigation', async ({ page }) => {
    // Navigate to page with IoT subscriptions
    await page.goto('http://localhost:3000/dashboard/batches');
    await page.waitForLoadState('networkidle');
    
    // Get initial memory
    const client = await page.context().newCDPSession(page);
    await client.send('HeapProfiler.enable');
    const memoryBefore = await getMemoryUsage(client);
    
    // Navigate away
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Force garbage collection if available
    try {
      await client.send('HeapProfiler.collectGarbage');
    } catch (e) {
      // GC might not be available in all browsers
      console.log('Garbage collection not available');
    }
    
    // Check memory after navigation
    const memoryAfter = await getMemoryUsage(client);
    const memoryReleased = memoryBefore - memoryAfter;
    const releasePercentage = (memoryReleased / memoryBefore) * 100;
    
    console.log(`Memory released after navigation: ${releasePercentage.toFixed(2)}%`);
    
    // At least 30% of subscription-related memory should be released
    expect(releasePercentage).toBeGreaterThan(30);
    
    await client.send('HeapProfiler.disable');
  });
});

/**
 * Helper function to get current memory usage from Chrome DevTools Protocol
 */
async function getMemoryUsage(client: any): Promise<number> {
  try {
    const metrics = await client.send('Performance.getMetrics');
    const jsHeapSize = metrics.metrics.find((m: any) => m.name === 'JSHeapUsedSize');
    return jsHeapSize ? jsHeapSize.value : 0;
  } catch (error) {
    console.error('Error getting memory usage:', error);
    return 0;
  }
}

/**
 * Analyze memory trend to detect leaks
 */
function analyzeMemoryTrend(measurements: number[]): {
  isLeaking: boolean;
  trend: 'stable' | 'growing' | 'fluctuating';
  averageGrowthPerMinute: number;
} {
  if (measurements.length < 3) {
    return { isLeaking: false, trend: 'stable', averageGrowthPerMinute: 0 };
  }
  
  // Calculate growth rate between consecutive measurements
  const growthRates: number[] = [];
  for (let i = 1; i < measurements.length; i++) {
    const growth = measurements[i] - measurements[i - 1];
    growthRates.push(growth);
  }
  
  // Calculate average growth per minute
  const totalGrowth = measurements[measurements.length - 1] - measurements[0];
  const averageGrowthPerMinute = totalGrowth / (measurements.length - 1);
  
  // Determine trend
  const positiveGrowthCount = growthRates.filter(r => r > 0).length;
  const negativeGrowthCount = growthRates.filter(r => r < 0).length;
  
  let trend: 'stable' | 'growing' | 'fluctuating';
  if (positiveGrowthCount > growthRates.length * 0.7) {
    trend = 'growing';
  } else if (negativeGrowthCount > growthRates.length * 0.7) {
    trend = 'stable'; // Memory is being released
  } else {
    trend = 'fluctuating';
  }
  
  // Determine if leaking
  // Consider it leaking if consistently growing with significant growth rate
  const isLeaking = trend === 'growing' && averageGrowthPerMinute > 1000000; // > 1MB per minute
  
  return {
    isLeaking,
    trend,
    averageGrowthPerMinute
  };
}
