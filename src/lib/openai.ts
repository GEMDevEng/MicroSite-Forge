const OPENAI_API_BASE = "https://api.openai.com/v1";
// API_KEY will be read dynamically to support testing

interface ContentGenerationRequest {
  keyword: string;
  contentType: 'blog-post' | 'landing-page' | 'about-us' | 'services' | 'contact-form';
  niche?: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'educational';
  wordCount?: number;
  includeImages?: boolean;
}

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  seoKeywords: string[];
  suggestedImages?: string[];
  contentScore?: number;
}

/**
 * Generate content using OpenAI API
 * @param request Content generation parameters
 * @returns Generated content object
 */
export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const API_KEY = process.env.OPENAI_API_KEY
  if (!API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const { keyword, contentType, niche, targetAudience, tone = 'professional', wordCount = 800 } = request;

  const systemPrompt = `You are a professional content writer and SEO specialist. Generate high-quality, engaging content based on the user's specifications. Return the response in valid JSON format with this structure:
  {
    "title": "SEO-optimized title",
    "content": "full content in Markdown format",
    "metaDescription": "SEO meta description (150-160 characters)",
    "seoKeywords": ["keyword1", "keyword2", "keyword3", "etc"],
    "suggestedImages": ["image description 1", "image description 2"],
    "contentScore": 95
  }

  Guidelines:
  - Write compelling, value-driven content
  - Include the main keyword naturally in title, first paragraph, and throughout
  - Use proper heading hierarchy (H2, H3 tags in Markdown)
  - Aim for the specified word count
  - Ensure mobile-friendly and reader-friendly formatting
  - Include relevant internal/external links where appropriate
  - Optimize for featured snippets opportunities`;

  const userPrompt = `Generate a ${contentType} for the topic "${keyword}"${niche ? ` in the ${niche} niche` : ''}${targetAudience ? ` targeting ${targetAudience}` : ''}.

  Content specifications:
  - Tone: ${tone}
  - Word count target: ${wordCount} words
  - Format: Markdown with proper headings
  - SEO-focused content structure
  - Include actionable takeaways or calls-to-action where appropriate
  ${request.includeImages ? '- Include detailed image suggestions' : ''}`;

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    // Parse the JSON response with error handling
    let parsed;
    try {
      parsed = JSON.parse(content) as GeneratedContent;
    } catch (jsonErr) {
      console.error("Failed to parse OpenAI API response as JSON:", jsonErr, content);
      throw new Error("Invalid JSON from OpenAI API");
    }

    // Validate required fields
    if (!parsed.title || !parsed.content) {
      throw new Error("Invalid response format from OpenAI");
    }

    return parsed;
  } catch (error) {
    console.error("OpenAI content generation error:", error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple content pieces for a microsite
 * @param contents Array of content requests
 * @returns Array of generated content
 */
export async function generateWebsiteContent(contents: ContentGenerationRequest[]): Promise<GeneratedContent[]> {
  const results: GeneratedContent[] = [];

  // Batch content generation (OpenAI recommended rate limiting)
  for (const contentRequest of contents) {
    try {
      const result = await generateContent(contentRequest);
      results.push(result);

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to generate content for ${contentRequest.keyword}:`, error);
      // Continue with other content pieces
      continue;
    }
  }

  return results;
}

/**
 * Validate and score generated content
 * @param content The content to validate
 * @param keyword The target keyword
 * @returns Validation results with score
 */
export function validateContentQuality(content: GeneratedContent, keyword: string) {
  let score = 100;
  const issues: string[] = [];

  // Check title optimization
  if (!content.title.toLowerCase().includes(keyword.toLowerCase())) {
    score -= 15;
    issues.push("Keyword not in title");
  }

  // Check content length (rough estimation)
  const wordCount = content.content.split(/\s+/).length;
  if (wordCount < 500) {
    score -= 10;
    issues.push("Content too short (< 500 words)");
  } else if (wordCount > 2000) {
    score -= 5;
    issues.push("Content very long (> 2000 words)");
  }

  // Check meta description length
  if (content.metaDescription.length > 160) {
    score -= 10;
    issues.push("Meta description too long");
  }

  // Check keyword in first paragraph
  const firstParagraph = content.content.split('\n\n')[0];
  if (!firstParagraph?.toLowerCase().includes(keyword.toLowerCase())) {
    score -= 10;
    issues.push("Keyword not in first paragraph");
  }

  // Check for headings
  const headingCount = (content.content.match(/^#+\s/gm) || []).length;
  if (headingCount < 2) {
    score -= 5;
    issues.push("Not enough headings");
  }

  return {
    score: Math.max(0, score),
    issues,
    wordCount,
    passed: score >= 70,
  };
}

/**
 * Generate optimized heading structure for content
 * @param keyword Main keyword
 * @param contentType Type of content
 * @returns Array of suggested headings
 */
export async function generateHeadingStructure(keyword: string, contentType: string): Promise<string[]> {
  const API_KEY = process.env.OPENAI_API_KEY
  if (!API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const systemPrompt = "You are an SEO content strategist. Generate an optimized heading structure (H1, H2, H3) for the given content type and keyword. Return as a JSON array of strings with full headings.";

  const userPrompt = `Generate 5-8 content headings for a ${contentType} centered around "${keyword}". Include H1 title and supporting H2/H3 headings. Focus on SEO value and user engagement.`;

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (jsonErr) {
      console.error("Failed to parse OpenAI API response as JSON:", jsonErr, content);
      throw new Error("Invalid JSON from OpenAI API");
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("OpenAI headings error:", error);
    throw new Error(`Failed to generate headings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
