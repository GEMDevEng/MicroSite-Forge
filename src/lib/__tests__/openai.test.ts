/**
 * @jest-environment node
 */
// Set test API key before imports
process.env.OPENAI_API_KEY = 'test-key';

import { generateContent, validateContentQuality } from '../openai'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('OpenAI API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-key'
  })

  describe('generateContent', () => {
    it('should generate SEO content with proper structure', async () => {
      const mockContent = {
        title: 'Complete Guide to Electrician Services',
        content: '# Complete Guide to Electrician Services\n\nThis comprehensive guide covers everything about electrical services...',
        metaDescription: 'Discover professional electrician services for residential and commercial properties. Expert electrical work at competitive prices.',
        seoKeywords: ['electrician services', 'electrical work', 'home wiring'],
        suggestedImages: ['electrical-service-hero.jpg', 'wiring-diagram.jpg'],
        contentScore: 92,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockContent) } }],
        }),
      } as Response)

      const result = await generateContent({
        keyword: 'electrician services',
        contentType: 'landing-page',
        niche: 'electrical services',
        targetAudience: 'homeowners',
        tone: 'professional',
        wordCount: 1000,
      })

      expect(result).toEqual(mockContent)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
          }),
        })
      )
    })

    it('should throw error when API key is missing', async () => {
      process.env.OPENAI_API_KEY = ''
      await expect(
        generateContent({
          keyword: 'test',
          contentType: 'blog-post',
        })
      ).rejects.toThrow('OPENAI_API_KEY is not configured')
    })

    it('should handle API response errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response)

      await expect(
        generateContent({
          keyword: 'test',
          contentType: 'blog-post',
        })
      ).rejects.toThrow()
    })

    it('should validate required response fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ invalid: 'structure' }) } }],
        }),
      } as Response)

      await expect(
        generateContent({
          keyword: 'test',
          contentType: 'blog-post',
        })
      ).rejects.toThrow('Invalid response format from OpenAI')
    })

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'not valid json' } }],
        }),
      } as Response)

      await expect(
        generateContent({
          keyword: 'test',
          contentType: 'blog-post',
        })
      ).rejects.toThrow('OpenAI API response was not valid JSON')
    })
  })

  describe('validateContentQuality', () => {
    it('should score perfect content correctly', () => {
      const content = {
        title: 'Complete Guide to Professional Plumbing Services',
        content: 'Complete Guide to Professional Plumbing Services\n\nWhen you need plumbing services, it\'s important to choose professional plumbing services that provide quality work.',
        metaDescription: 'Professional plumbing services for all your residential and commercial plumbing needs.',
        seoKeywords: [],
        suggestedImages: [],
      }

      const result = validateContentQuality(content, 'plumbing services')

      expect(result.score).toBeGreaterThan(80)
      expect(result.passed).toBe(true)
      expect(result.issues).toBeInstanceOf(Array)
    })

    it('should penalize content missing keyword in title', () => {
      const content = {
        title: 'Home Repair Services',
        content: 'Complete Guide to Professional Plumbing Services\n\nPlumbing services are essential for maintaining your home.',
        metaDescription: 'Professional plumbing services.',
        seoKeywords: [],
        suggestedImages: [],
      }

      const result = validateContentQuality(content, 'plumbing services')

      expect(result.score).toBeLessThan(100)
      expect(result.issues).toContain('Keyword not in title')
    })

    it('should penalize content that\'s too short', () => {
      const content = {
        title: 'Plumbing Services',
        content: 'Short content about plumbing.',
        metaDescription: 'Meta.',
        seoKeywords: [],
        suggestedImages: [],
      }

      const result = validateContentQuality(content, 'plumbing services')

      expect(result.score).toBeLessThan(90)
      expect(result.issues).toContain('Content too short (< 500 words)')
    })

    it('should penalize meta descriptions that are too long', () => {
      const content = {
        title: 'Plumbing Services',
        content: 'Great content about plumbing services '.repeat(100),
        metaDescription: 'This meta description is way too long and exceeds the 160 character limit for SEO purposes which is not good for search engine optimization and can cause issues with how search engines display your page results.'.repeat(2),
        seoKeywords: [],
        suggestedImages: [],
      }

      const result = validateContentQuality(content, 'plumbing services')

      expect(result.score).toBeLessThan(95)
      expect(result.issues).toContain('Meta description too long')
    })
  })
})
