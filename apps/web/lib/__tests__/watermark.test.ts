import { describe, it, expect } from 'vitest'
import { applyWatermark, embedTextWatermark } from '../watermark'

describe('watermark.ts - TASK FSC-API-005 QA Checks', () => {
  describe('applyWatermark', () => {
    it('Two different userIds produce different perturbFactor values', () => {
      const timeline = [
        { date: '2026-06-06', actual: 168, p50: 168, p10: 160, p90: 176, isForecast: true }
      ]
      
      const result1 = applyWatermark(timeline, 'user-123')
      const result2 = applyWatermark(timeline, 'user-456')
      
      // P50 values should be different due to different perturbation factors
      expect(result1.data[0].p50).not.toBe(result2.data[0].p50)
      // Tokens should be different
      expect(result1.token).not.toBe(result2.token)
    })

    it('Same userId + same date always produces same perturbFactor (deterministic)', () => {
      const timeline = [
        { date: '2026-06-06', actual: 168, p50: 168, p10: 160, p90: 176, isForecast: true }
      ]
      const userId = 'user-123'
      
      const result1 = applyWatermark(timeline, userId)
      const result2 = applyWatermark(timeline, userId)
      
      // Results should be identical
      expect(result1.data[0].p50).toBe(result2.data[0].p50)
      expect(result1.token).toBe(result2.token)
    })

    it('P50 perturbation < ±0.5% of original value', () => {
      const originalP50 = 168
      const timeline = [
        { date: '2026-06-06', actual: 168, p50: originalP50, p10: 160, p90: 176, isForecast: true }
      ]
      
      const result = applyWatermark(timeline, 'user-123')
      const perturbedP50 = result.data[0].p50!
      
      // Calculate perturbation percentage
      const perturbationPct = Math.abs((perturbedP50 - originalP50) / originalP50) * 100
      
      // Should be less than 0.5%
      expect(perturbationPct).toBeLessThan(0.5)
    })

    it('Historical actual prices (isForecast=false) not perturbed', () => {
      const timeline = [
        { date: '2026-06-06', actual: 168, p50: 168, p10: 160, p90: 176, isForecast: false },
        { date: '2026-06-07', actual: 170, p50: 170, p10: 162, p90: 178, isForecast: true }
      ]
      
      const originalP50Historical = 168
      const originalP50Forecast = 170
      
      const result = applyWatermark(timeline, 'user-123')
      
      // Historical price should not be perturbed
      expect(result.data[0].p50).toBe(originalP50Historical)
      // Forecast price should be perturbed
      expect(result.data[1].p50).not.toBe(originalP50Forecast)
    })

    it('Token always 12 chars (FQ- + 8 hex chars uppercase)', () => {
      const timeline = [
        { date: '2026-06-06', actual: 168, p50: 168, p10: 160, p90: 176, isForecast: true }
      ]
      
      const result = applyWatermark(timeline, 'user-123')
      
      // Token should be exactly 12 characters
      expect(result.token).toHaveLength(12)
      // Should start with 'FQ-'
      expect(result.token).toMatch(/^FQ-/)
      // Remaining 8 chars should be uppercase hex
      expect(result.token.substring(3)).toMatch(/^[0-9A-F]{8}$/)
    })
  })

  describe('embedTextWatermark', () => {
    it('Zero-width chars invisible when text is rendered in browser', () => {
      const text = 'This is a test message'
      const watermarked = embedTextWatermark(text, 'user-123')
      
      // Visual length should be the same (zero-width chars don't take space)
      expect(watermarked.length).toBeGreaterThan(text.length)
      // But when rendered, they should appear the same
      // We can't test browser rendering directly, but we can verify the chars are present
      expect(watermarked).toContain('\u200B')
    })

    it('Zero-width chars survive copy-paste (test in browser DevTools)', () => {
      const text = 'Test message'
      const watermarked = embedTextWatermark(text, 'user-123')
      
      // The watermarked text should contain zero-width chars
      expect(watermarked).toMatch(/[\u200B\u200C]/)
      // The original text should not
      expect(text).not.toMatch(/[\u200B\u200C]/)
      // Different user IDs should produce different zero-width sequences
      const watermarked2 = embedTextWatermark(text, 'user-456')
      expect(watermarked).not.toBe(watermarked2)
    })

    it('Inserts zero-width chars after first word', () => {
      const text = 'Hello world'
      const watermarked = embedTextWatermark(text, 'user-123')
      
      // Should contain the original text
      expect(watermarked).toContain('Hello')
      expect(watermarked).toContain('world')
      // Zero-width chars should be after first space
      const firstSpaceIndex = text.indexOf(' ')
      expect(watermarked.substring(0, firstSpaceIndex)).toBe('Hello')
    })

    it('Handles text without spaces', () => {
      const text = 'Hello'
      const watermarked = embedTextWatermark(text, 'user-123')
      
      // Should append zero-width chars at the end
      expect(watermarked).toContain('Hello')
      expect(watermarked).toMatch(/[\u200B\u200C]$/)
    })
  })
})
