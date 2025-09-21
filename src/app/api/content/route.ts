import { NextRequest, NextResponse } from 'next/server';
import { generateContent, generateWebsiteContent, validateContentQuality } from '@/lib/openai';
import { z } from 'zod';

// Validation schema for content generation request
const ContentGenerationSchema = z.object({
  keyword: z.string().min(2).max(100),
  contentType: z.enum(['blog-post', 'landing-page', 'about-us', 'services', 'contact-form']),
  niche: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'educational']).optional(),
  wordCount: z.number().min(200).max(5000).optional(),
  includeImages: z.boolean().default(false),
});

// Schema for website content generation (multiple pieces)
const WebsiteContentSchema = z.object({
  contents: z.array(ContentGenerationSchema).min(1).max(10),
});

// Response type for generated content
interface ContentResponse {
  success: boolean;
  data: {
    title: string;
    content: string;
    metaDescription: string;
    seoKeywords: string[];
    suggestedImages?: string[];
    contentScore?: number;
    validation: {
      score: number;
      issues: string[];
      wordCount: number;
      passed: boolean;
    };
  };
}

// POST /api/content - Generate a single piece of content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = ContentGenerationSchema.parse(body);

    // Generate content
    const generatedContent = await generateContent(validated);

    if (!generatedContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content generation failed',
        },
        { status: 500 }
      );
    }

    // Validate the generated content
    const validation = validateContentQuality(generatedContent, validated.keyword);

    const response: ContentResponse = {
      success: true,
      data: {
        title: generatedContent.title,
        content: generatedContent.content,
        metaDescription: generatedContent.metaDescription,
        seoKeywords: generatedContent.seoKeywords,
        suggestedImages: generatedContent.suggestedImages,
        contentScore: generatedContent.contentScore,
        validation,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Content generation API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/content/website - Generate multiple content pieces for a website
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { contents } = WebsiteContentSchema.parse(body);

    // Generate all content pieces
    const generatedContents = await generateWebsiteContent(contents);

    for (const content of generatedContents) {
      if (!content) {
        return NextResponse.json(
          {
            success: false,
            error: 'Content generation failed',
          },
          { status: 500 }
        );
      }
    }

    // Validate each piece
    const validatedContents = generatedContents.map((content, index) => {
      const validation = validateContentQuality(content, contents[index].keyword);
      return {
        ...content,
        validation,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        contents: validatedContents,
        total: validatedContents.length,
        summary: {
          passing: validatedContents.filter(c => c.validation.passed).length,
          avgScore: validatedContents.reduce((sum, c) => sum + c.validation.score, 0) / validatedContents.length,
        },
      },
    });
  } catch (error) {
    console.error('Website content generation API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
