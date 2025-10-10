/**
 * Cloudflare Worker for RAG-enhanced research
 * Uses Vectorize for document retrieval and AI for generation
 */

interface ResearchRequest {
  niche: string
  targetAudience?: string
  geography?: string
  competitorAnalysis?: boolean
  researchContext?: string
}

// Document interface for vector storage
interface ResearchDocument {
  id: string
  content: string
  metadata: {
    topic: string
    source: string
    timestamp: string
    relevance: number
  }
}

// Response interface
interface ResearchResult {
  niche: string
  keywords: Array<{
    keyword: string
    searchVolume: number
    competition: 'high' | 'medium' | 'low'
    cpc: number
    trending: boolean
  }>
  trendingTopics: string[]
  contentOpportunities: string[]
  competitorInsights?: string[]
}

interface RAGResearchResponse extends ResearchResult {
  retrievedContext: string[]
  confidence: number
}

export interface Env {
  AI: any
  VECTORIZE: any
  RESEARCH_CACHE: any
  GROK_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const researchRequest: ResearchRequest = await request.json()

      // Check cache first
      const cacheKey = `research:${JSON.stringify(researchRequest)}`
      const cached = await env.RESEARCH_CACHE.get(cacheKey)
      if (cached) {
        return new Response(cached, {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const result = await performRAGResearch(researchRequest, env)

      // Cache result for 1 hour
      await env.RESEARCH_CACHE.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 3600
      })

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('RAG research error:', error)
      return new Response(JSON.stringify({ error: 'Research failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

async function performRAGResearch(request: ResearchRequest, env: Env): Promise<RAGResearchResponse> {
  // 1. Generate search query for vector retrieval
  const searchQuery = generateSearchQuery(request)

  // 2. Retrieve relevant documents from vector store
  const retrievedDocs = await retrieveRelevantDocuments(searchQuery, env)

  // 3. Perform hybrid research (RAG + Grok fallback)
  const researchResult = await generateRAGResponse(request, retrievedDocs, env)

  // 4. Calculate confidence based on retrieved context
  const confidence = calculateConfidence(retrievedDocs, researchResult)

  return {
    ...researchResult,
    retrievedContext: retrievedDocs.map(doc => doc.content.substring(0, 200) + '...'),
    confidence
  }
}

function generateSearchQuery(request: ResearchRequest): string {
  let query = `business research ${request.niche}`

  if (request.targetAudience) {
    query += ` ${request.targetAudience}`
  }
  if (request.geography) {
    query += ` ${request.geography}`
  }
  if (request.competitorAnalysis) {
    query += ' competitor analysis market share'
  }

  return query
}

async function retrieveRelevantDocuments(query: string, env: Env): Promise<ResearchDocument[]> {
  try {
    // Vector search for relevant documents
    const results = await env.VECTORIZE.query(query, { topK: 5, returnValues: true })

    const documents: ResearchDocument[] = []
    for (const result of results) {
      if (result.score > 0.7) { // Relevance threshold
        documents.push({
          id: result.id,
          content: result.values.join(' '),
          metadata: result.metadata
        })
      }
    }

    return documents
  } catch (error) {
    console.warn('Vector retrieval failed, using fallback:', error)
    return []
  }
}

async function generateRAGResponse(
  request: ResearchRequest,
  contextDocs: ResearchDocument[],
  env: Env
): Promise<ResearchResult> {
  // Build context from retrieved documents
  const context = contextDocs.map(doc => doc.content).join('\n\n')

  // Enhanced prompt with retrieved context
  const systemPrompt = `You are an expert SEO strategist and content marketer with access to market research data.

  Retrieved Context:
  ${context}

  Based on the above research data and your expertise, provide comprehensive keyword research and niche analysis. Always consider the retrieved context for more accurate insights.

  Response Format:
  {
    "niche": "the original niche provided",
    "keywords": [
      {"keyword": "string", "searchVolume": number, "competition": "high|medium|low", "cpc": number, "trending": boolean}
    ],
    "trendingTopics": ["array of 5-7 trending topics from context"],
    "contentOpportunities": ["array of 5-10 content ideas based on research data"],
    "competitorInsights": ["optional array of competitor analysis points from data"]
  }

  Focus on data-driven insights enhanced by the retrieved research context.`

  const userPrompt = `Analyze the following niche for keyword research:
  - Niche: ${request.niche}
  ${request.targetAudience ? `- Target Audience: ${request.targetAudience}` : ''}
  ${request.geography ? `- Geography: ${request.geography}` : ''}
  ${request.competitorAnalysis ? '- Include competitor analysis' : ''}

  Provide detailed keyword research and market insights enhanced by available research data.`

  try {
    // Try Cloudflare AI first
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })

    const content = aiResponse.response
    const parsed = parseJSONResponse(content)
    return parsed
  } catch (aiError) {
    console.warn('Cloudflare AI failed, falling back to Grok:', aiError)

    // Fallback to Grok API
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    })

    const grokData = await grokResponse.json()
    const content = grokData.choices[0]?.message?.content
    const parsed = parseJSONResponse(content)
    return parsed
  }
}

function parseJSONResponse(content: string): ResearchResult {
  try {
    return JSON.parse(content)
  } catch {
    console.error('Invalid JSON response:', content)
    // Return safe fallback
    return {
      niche: '',
      keywords: [],
      trendingTopics: [],
      contentOpportunities: [],
      competitorInsights: []
    }
  }
}

function calculateConfidence(documents: ResearchDocument[], response: any): number {
  // Calculate confidence based on:
  // - Number of retrieved documents
  // - Average relevance score
  // - Response completeness

  let confidence = 0.5 // Base confidence

  if (documents.length > 0) {
    confidence += 0.2
    const avgRelevance = documents.reduce((sum, doc) => sum + (doc.metadata.relevance || 0), 0) / documents.length
    confidence += avgRelevance * 0.3
  }

  if (response.keywords.length > 0) {
    confidence += 0.1
  }
  if (response.contentOpportunities.length > 0) {
    confidence += 0.1
  }
  if (response.trendingTopics.length > 0) {
    confidence += 0.1
  }

  return Math.min(confidence, 1.0)
}
