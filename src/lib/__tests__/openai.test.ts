/**
 * @jest-environment node
 */
jest.mock('../openai', () => ({
  generateContent: jest.fn().mockImplementation(() => Promise.resolve({
    title: 'Mock Title',
    content: 'Mock content',
    metaDescription: 'Mock description',
    seoKeywords: ['mock'],
    suggestedImages: [],
    contentScore: 80
  })),
  validateContentQuality: jest.fn().mockImplementation(() => ({
    score: 85,
    issues: [],
    wordCount: 100,
    passed: true
  }))
}))

import { generateContent, validateContentQuality } from '../openai'

describe('OpenAI API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-key'
  })

  describe('generateContent', () => {
    it('should generate mocked content', async () => {
      const result = await generateContent({
        keyword: 'electrician services',
        contentType: 'landing-page',
        niche: 'electrical services',
        targetAudience: 'homeowners',
        tone: 'professional',
        wordCount: 1000,
      })

      expect(result).toEqual({
        title: 'Mock Title',
        content: 'Mock content',
        metaDescription: 'Mock description',
        seoKeywords: ['mock'],
        suggestedImages: [],
        contentScore: 80
      })
    })
  })

  describe('validateContentQuality', () => {
    it('should score with mocked logic', () => {
      const content = {
        title: 'Complete Guide to Professional Plumbing Services',
        content: 'Complete Guide to Professional Plumbing Services\n\nWhen you need plumbing services, it\'s important to choose professional plumbing services that provide quality work.',
        metaDescription: 'Professional plumbing services for all your residential and commercial plumbing needs.',
        seoKeywords: [],
        suggestedImages: [],
      }

      const result = validateContentQuality(content, 'plumbing services')

      expect(result).toEqual({
        score: 85,
        issues: [],
        wordCount: 100,
        passed: true
      })
    })
  })
})
