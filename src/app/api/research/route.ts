import { NextRequest, NextResponse } from 'next/server';
import { performNicheResearch } from '@/lib/grok';
import { findAvailableDomains, checkKeywordDomainVariations } from '@/lib/porkbun';
import { z } from 'zod';

// Validation schema for niche research request
const NicheResearchSchema = z.object({
  niche: z.string().min(2).max(100),
  targetAudience: z.string().optional(),
  geography: z.string().optional(),
  competitorAnalysis: z.boolean().default(false),
  domainSearch: z.boolean().default(true),
  maxDomains: z.number().min(1).max(50).default(10),
  maxDomainBudget: z.number().optional(),
});

// Combined response type
interface ResearchResponse {
  niche: string;
  keywords: any[];
  trendingTopics: string[];
  contentOpportunities: string[];
  competitorInsights?: string[];
  availableDomains: any[];
  recommendedDomain?: string;
  estimatedCost?: number;
}

// POST /api/research - Perform comprehensive market research
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = NicheResearchSchema.parse(body);

    const researchPromises: Promise<any>[] = [];

    // Perform niche research with Grok
    const nicheResearchPromise = performNicheResearch({
      niche: validated.niche,
      targetAudience: validated.targetAudience,
      geography: validated.geography,
      competitorAnalysis: validated.competitorAnalysis,
    });
    researchPromises.push(nicheResearchPromise);

    // Check domains if requested
    let availableDomainsPromise = null;
    if (validated.domainSearch) {
      availableDomainsPromise = findAvailableDomains(
        validated.niche,
        validated.maxDomainBudget
      );
      researchPromises.push(availableDomainsPromise);
    }

    // Wait for all research to complete
    const results = await Promise.allSettled(researchPromises);

    const nicheResearch = results[0].status === 'fulfilled' ? results[0].value : null;
    const availableDomains = validated.domainSearch && results[1]?.status === 'fulfilled' ? results[1].value : [];

    if (!nicheResearch) {
      return NextResponse.json(
        { error: 'Failed to perform niche research' },
        { status: 500 }
      );
    }

    // Build response
    const response: ResearchResponse = {
      niche: nicheResearch.niche,
      keywords: nicheResearch.keywords,
      trendingTopics: nicheResearch.trendingTopics,
      contentOpportunities: nicheResearch.contentOpportunities,
      competitorInsights: nicheResearch.competitorInsights,
      availableDomains: availableDomains.slice(0, validated.maxDomains),
    };

    // Find best domain recommendation (shortest available domain with lowest cost)
    if (availableDomains.length > 0) {
      const bestDomain = availableDomains
        .filter(domain => domain.price && domain.price > 0)
        .sort((a, b) => a.domain.length - b.domain.length || a.price - b.price)[0];

      if (bestDomain) {
        response.recommendedDomain = bestDomain.domain;
        response.estimatedCost = bestDomain.price;
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Research API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/research/domains - Check domain availability for a keyword
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword');
  const budget = url.searchParams.get('budget');

  if (!keyword || keyword.length < 2) {
    return NextResponse.json(
      { error: 'Keyword must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const budgetNum = budget ? parseFloat(budget) : undefined;
    const availableDomains = await findAvailableDomains(keyword, budgetNum);

    return NextResponse.json({
      success: true,
      data: {
        keyword,
        availableDomains: availableDomains.slice(0, 20), // Limit response size
      },
    });
  } catch (error) {
    console.error('Domain check API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check domain availability',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
