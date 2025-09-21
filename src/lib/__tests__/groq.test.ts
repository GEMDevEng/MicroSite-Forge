/**
 * @jest-environment node
 */
jest.mock('../grok', () => ({
  performNicheResearch: jest.fn().mockImplementation(() => Promise.resolve({ niche: 'mock-niche' })),
  generateContentIdeas: jest.fn().mockImplementation(() => Promise.resolve(['mock idea 1', 'mock idea 2']))
}))

import { performNicheResearch, generateContentIdeas } from '../grok'

describe('Grok API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set mock API key for tests
    process.env.GROK_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    // Clean up after tests
    delete process.env.GROK_API_KEY
  })

  describe('performNicheResearch', () => {
    it('should return mocked niche data', async () => {
      const result = await performNicheResearch({
        niche: 'plumbers',
        targetAudience: 'homeowners',
        geography: 'local',
        competitorAnalysis: true,
      })

      expect(result).toEqual({ niche: 'mock-niche' })
    })
  })

  describe('generateContentIdeas', () => {
    it('should return mocked content ideas', async () => {
      const result = await generateContentIdeas('plumbing emergencies', 'blog-post')
      expect(result).toEqual(['mock idea 1', 'mock idea 2'])
    })
  })
})
