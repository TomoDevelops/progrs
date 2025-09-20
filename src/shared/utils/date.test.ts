import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTodayInTimezone,
  isToday,
  isCompletedToday,
  toLocalDateString,
  getUserTimezone
} from './date'

describe('Timezone-aware date utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('getTodayInTimezone', () => {
    it('should return correct date for UTC timezone', () => {
      // Mock current time to 2024-01-15 12:00:00 UTC
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      
      const result = getTodayInTimezone('UTC')
      expect(result).toBe('2024-01-15')
    })

    it('should return correct date for New York timezone (EST)', () => {
      // Mock current time to 2024-01-15 05:00:00 UTC (midnight EST)
      vi.setSystemTime(new Date('2024-01-15T05:00:00Z'))
      
      const result = getTodayInTimezone('America/New_York')
      expect(result).toBe('2024-01-15')
    })

    it('should handle midnight transition in New York timezone', () => {
      // Mock current time to 2024-01-15 04:59:59 UTC (23:59:59 EST previous day)
      vi.setSystemTime(new Date('2024-01-15T04:59:59Z'))
      
      const result = getTodayInTimezone('America/New_York')
      expect(result).toBe('2024-01-14')
    })

    it('should handle Tokyo timezone (JST)', () => {
      // Mock current time to 2024-01-15 15:00:00 UTC (midnight JST next day)
      vi.setSystemTime(new Date('2024-01-15T15:00:00Z'))
      
      const result = getTodayInTimezone('Asia/Tokyo')
      expect(result).toBe('2024-01-16')
    })

    it('should handle Sydney timezone with DST', () => {
      // Mock current time to 2024-01-15 13:00:00 UTC (midnight AEDT)
      vi.setSystemTime(new Date('2024-01-15T13:00:00Z'))
      
      const result = getTodayInTimezone('Australia/Sydney')
      expect(result).toBe('2024-01-16')
    })

    it('should default to system timezone when no timezone provided', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      
      const result = getTodayInTimezone()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })



  describe('isToday', () => {
    it('should return true for same date in timezone', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      
      const result = isToday('2024-01-15', 'UTC')
      expect(result).toBe(true)
    })

    it('should return false for different date in timezone', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      
      const result = isToday('2024-01-14', 'UTC')
      expect(result).toBe(false)
    })

    it('should handle midnight edge case correctly', () => {
      // Mock current time to 2024-01-15 04:59:59 UTC (23:59:59 EST)
      vi.setSystemTime(new Date('2024-01-15T04:59:59Z'))
      
      // Should be 2024-01-14 in New York timezone
      expect(isToday('2024-01-14', 'America/New_York')).toBe(true)
      expect(isToday('2024-01-15', 'America/New_York')).toBe(false)
    })

    it('should handle timezone transition after midnight', () => {
      // Mock current time to 2024-01-15 05:00:00 UTC (00:00:00 EST)
      vi.setSystemTime(new Date('2024-01-15T05:00:00Z'))
      
      // Should be 2024-01-15 in New York timezone
      expect(isToday('2024-01-15', 'America/New_York')).toBe(true)
      expect(isToday('2024-01-14', 'America/New_York')).toBe(false)
    })
  })

  describe('isCompletedToday', () => {
    it('should return true for workout completed today in user timezone', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      const completedAt = new Date('2024-01-15T10:00:00Z')
      
      const result = isCompletedToday(completedAt, 'UTC')
      expect(result).toBe(true)
    })

    it('should return false for workout completed yesterday in user timezone', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      const completedAt = new Date('2024-01-14T10:00:00Z')
      
      const result = isCompletedToday(completedAt, 'UTC')
      expect(result).toBe(false)
    })

    it('should handle midnight edge case for workout completion', () => {
      // Current time: 2024-01-15 05:00:00 UTC (midnight EST)
      vi.setSystemTime(new Date('2024-01-15T05:00:00Z'))
      
      // Workout completed at 2024-01-15 04:30:00 UTC (23:30 EST previous day)
      const completedAt = new Date('2024-01-15T04:30:00Z')
      
      // Should be false because it was completed on 2024-01-14 in EST
      expect(isCompletedToday(completedAt, 'America/New_York')).toBe(false)
    })

    it('should handle workout completed just after midnight in user timezone', () => {
      // Current time: 2024-01-15 12:00:00 UTC
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      
      // Workout completed at 2024-01-15 05:30:00 UTC (00:30 EST)
      const completedAt = new Date('2024-01-15T05:30:00Z')
      
      // Should be true because it was completed on 2024-01-15 in EST
      expect(isCompletedToday(completedAt, 'America/New_York')).toBe(true)
    })

    it('should handle different timezones correctly', () => {
      // Current time: 2024-01-15 15:00:00 UTC (midnight JST next day)
      vi.setSystemTime(new Date('2024-01-15T15:00:00Z'))
      
      // Workout completed at 2024-01-15 14:30:00 UTC (23:30 JST)
      const completedAt = new Date('2024-01-15T14:30:00Z')
      
      // Should be false in Tokyo timezone (completed on 2024-01-15, today is 2024-01-16)
      expect(isCompletedToday(completedAt, 'Asia/Tokyo')).toBe(false)
      
      // Should be true in UTC timezone (both on 2024-01-15)
      expect(isCompletedToday(completedAt, 'UTC')).toBe(true)
    })
  })

  describe('toLocalDateString', () => {
    it('should format date correctly for different timezones', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      
      expect(toLocalDateString(date, 'UTC')).toBe('2024-01-15')
      expect(toLocalDateString(date, 'America/New_York')).toBe('2024-01-15')
      expect(toLocalDateString(date, 'Asia/Tokyo')).toBe('2024-01-15')
    })

    it('should handle midnight edge cases', () => {
      const date = new Date('2024-01-15T00:00:00Z') // Midnight UTC
      
      expect(toLocalDateString(date, 'UTC')).toBe('2024-01-15')
      // 5 hours behind UTC in EST
      expect(toLocalDateString(date, 'America/New_York')).toBe('2024-01-14')
      // 9 hours ahead of UTC in JST
      expect(toLocalDateString(date, 'Asia/Tokyo')).toBe('2024-01-15')
    })
  })

  describe('getUserTimezone', () => {
    it('should return system timezone', () => {
      const result = getUserTimezone()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle invalid timezone by throwing error', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
      
      // Should throw error for invalid timezone
      expect(() => getTodayInTimezone('Invalid/Timezone')).toThrow('Invalid time zone')
    })

    it('should handle DST transitions correctly', () => {
      // Test during DST transition in New York (March 10, 2024)
      vi.setSystemTime(new Date('2024-03-10T07:00:00Z'))
      
      const result = getTodayInTimezone('America/New_York')
      expect(result).toBe('2024-03-10')
    })

    it('should handle year boundary correctly', () => {
      // New Year's Eve in UTC, but New Year's Day in Tokyo
      vi.setSystemTime(new Date('2023-12-31T15:00:00Z'))
      
      expect(getTodayInTimezone('UTC')).toBe('2023-12-31')
      expect(getTodayInTimezone('Asia/Tokyo')).toBe('2024-01-01')
    })
  })
})