// Test for src/lib/utils.ts
import { cn } from '../utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle undefined and falsy values', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isInactive = false
      expect(cn('base', isActive && 'active', isInactive && 'inactive')).toBe('base active')
    })
  })
})
