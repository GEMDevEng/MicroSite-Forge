/**
 * @jest-environment node
 */
import { performNicheResearch, generateContentIdeas } from '../grok'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

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
    it('should perform niche research and return structured data', async () => {
      const mockResponse = {
        niche: 'plumbers',
        keywords: [
          {
            keyword: 'plumber near me',
            searchVolume: 50000,
            competition: 'high' as const,
            cpc: 2.5,
            trending: false,
          },
        ],
        trendingTopics: ['emergency plumbing', 'water heater repair'],
        contentOpportunities: ['emergency plumbing guide', 'DIY plumbing tips'],
        competitorInsights: ['Local SEO focus', 'Review management important'],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockResponse) } }],
        }),
      } as Response)

      const result = await performNicheResearch({
        niche: 'plumbers',
        targetAudience: 'homeowners',
        geography: 'local',
        competitorAnalysis: true,
      })

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      )
    })

    it('should throw error when API key is not configured', async () => {
      process.env.GROK_API_KEY = ''
      await expect(
        performNicheResearch({ niche: 'test' })
      ).rejects.toThrow('GROK_API_KEY is not configured')
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      process.env.GROK_API_KEY = 'test-key'
      const result = await performNicheResearch({ niche: 'test' })
      expect(result.niche).toBe('test') // fallback to request.niche
    })

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'invalid json response' } }],
        }),
      } as Response)

      process.env.GROK_API_KEY = 'test-key'
      const result = await performNicheResearch({ niche: 'test' })
      expect(result.niche).toBe('test') // fallback to request.niche
    })
  })

  describe('generateContentIdeas', () => {
    it('should generate content ideas for a keyword', async () => {
      const mockIdeas = [
        '10 Emergency Plumbing Tips for Homeowners',
        'Signs You Need a Plumber Immediately',
        'Cost of Common Plumbing Repairs',
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockIdeas) } }],
        }),
      } as Response)

      const result = await generateContentIdeas('plumbing emergencies', 'blog-post')

      expect(result).toEqual(mockIdeas)
    })

    it('should use default content type when not specified', async () => {
      const mockIdeas = ['Idea 1', 'Idea 2', 'Idea 3']

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockIdeas) } }],
        }),
      } as Response)

      const result = await generateContentIdeas('test keyword')

      expect(result).toEqual(mockIdeas)
    })

    it('should return empty array for invalid response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'invalid json' } }],
        }),
      } as Response)

      const result = await generateContentIdeas('test')

      expect(result).toEqual([])
    })
  })
})
