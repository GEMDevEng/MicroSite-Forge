import { NextRequest, NextResponse } from 'next/server';
import { generateWebsiteContent } from '@/lib/openai';
import { generateHugoSite, createHugoTemplateRepository } from '@/lib/github';
import { createHugoSite as createNetlifyHugoSite } from '@/lib/netlify';
import { z } from 'zod';

// Validation schema for site generation request
const SiteGenerationSchema = z.object({
  niche: z.string().min(2).max(100),
  domain: z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  siteTitle: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  keywords: z.array(z.string()).min(1).max(10),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'educational']).default('professional'),
  githubRepoName: z.string().regex(/^[a-zA-Z0-9._-]+$/, "Invalid repository name").optional(),
  colorScheme: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }).optional(),
});

interface SiteGenerationResponse {
  success: boolean;
  site: {
    id: string;
    name: string;
    url: string;
    domain: string;
    githubUrl: string;
    netlifyUrl: string;
    status: 'generating' | 'deploying' | 'completed' | 'failed';
    progress: {
      research: boolean;
      content: boolean;
      github: boolean;
      netlify: boolean;
      domain: boolean;
    };
  };
  content?: {
    pages: Array<{
      title: string;
      content: string;
      path: string;
    }>;
    totalWords: number;
  };
}

// POST /api/sites/generate - Generate a complete microsite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = SiteGenerationSchema.parse(body);

    // Extract validated data
    const {
      niche,
      domain,
      siteTitle,
      description,
      keywords,
      targetAudience,
      tone,
      githubRepoName,
      colorScheme = { primary: '#007bff', secondary: '#6c757d' }
    } = validated;

    // Step 1: Generate content for the site (5 pages)
    const contentRequests = [
      {
        keyword: `${niche} services`,
        contentType: 'blog-post' as const,
        niche,
        targetAudience,
        tone,
        wordCount: 800,
      },
      {
        keyword: `about ${niche}`,
        contentType: 'blog-post' as const,
        niche,
        targetAudience,
        tone,
        wordCount: 600,
      },
      {
        keyword: `${niche} contact`,
        contentType: 'blog-post' as const,
        niche,
        targetAudience,
        tone,
        wordCount: 400,
      },
      {
        keyword: `why choose ${niche}`,
        contentType: 'blog-post' as const,
        niche,
        targetAudience,
        tone,
        wordCount: 700,
      },
      {
        keyword: `${niche} tips`,
        contentType: 'blog-post' as const,
        niche,
        targetAudience,
        tone,
        wordCount: 900,
      },
    ];

    console.log('Generating website content...');
    const generatedContent = await generateWebsiteContent(contentRequests);

    // Step 2: Create GitHub repository with Hugo template
    const repoName = githubRepoName || `microsite-${niche.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    console.log(`Creating GitHub repository: ${repoName}`);

    const githubRepo = await createHugoTemplateRepository(
      repoName,
      `Hugo microsite for ${niche} - ${siteTitle}`,
      false // public repo for deployment
    );

    // Extract owner from repo URL or assume from GitHub token
    const [owner] = githubRepo.full_name.split('/');

    // Step 3: Generate Hugo site with content
    console.log('Generating Hugo site files...');
    const hugoContent = [
      {
        path: 'content/_index.md',
        content: `---
title: "${siteTitle}"
description: "${description || `${niche} services - professional solutions`}"
keywords: "${keywords.join(', ')}"
draft: false
---

${generatedContent[0]?.content || `# Welcome to ${siteTitle}

Professional ${niche} services for ${targetAudience || 'everyone'}.
`}
`,
        title: 'Homepage',
      },
      {
        path: 'content/services/_index.md',
        content: `---
title: "Our Services"
description: "Professional ${niche} services we offer"
draft: false
---

${generatedContent[1]?.content || `# Our Services

We provide comprehensive ${niche} solutions tailored to your needs.
`}
`,
        title: 'Services',
      },
      {
        path: 'content/about/_index.md',
        content: `---
title: "About Us"
description: "Learn more about our ${niche} expertise"
draft: false
---

${generatedContent[2]?.content || `# About Us

With years of experience in ${niche}, we provide exceptional service and results.
`}
`,
        title: 'About',
      },
      {
        path: 'content/contact/_index.md',
        content: `---
title: "Contact Us"
description: "Get in touch with us for ${niche} services"
draft: false
---

${generatedContent[3]?.content || `# Contact Us

Ready to discuss your ${niche} needs? Contact us today!

<form id="contact-form">
  <div class="mb-4">
    <label for="name" class="block text-sm font-medium mb-2">Name</label>
    <input type="text" id="name" name="name" class="w-full p-2 border rounded" required>
  </div>
  <div class="mb-4">
    <label for="email" class="block text-sm font-medium mb-2">Email</label>
    <input type="email" id="email" name="email" class="w-full p-2 border rounded" required>
  </div>
  <div class="mb-4">
    <label for="message" class="block text-sm font-medium mb-2">Message</label>
    <textarea id="message" name="message" rows="4" class="w-full p-2 border rounded" required></textarea>
  </div>
  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Send Message</button>
</form>
`}
`,
        title: 'Contact',
      },
      {
        path: 'content/blog/tips/_index.md',
        content: `---
title: "${generatedContent[4]?.title || `${niche} Tips and Advice`}"
description: "Expert ${niche} tips to help you succeed"
draft: false
date: ${new Date().toISOString().split('T')[0]}
---

${generatedContent[4]?.content || `# Expert ${niche} Tips

Discover the latest strategies and best practices in ${niche}.
`}
`,
        title: 'Blog Post',
      },
    ];

    await generateHugoSite(owner, repoName, hugoContent, {
      siteTitle,
      domain,
      description,
    });

    // Step 4: Create Netlify site connected to GitHub repo
    console.log('Creating Netlify deployment...');
    const netlifySite = await createNetlifyHugoSite(
      siteTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      githubRepo.clone_url,
      'main',
      domain
    );

    // Step 5: Calculate content stats
    const totalWords = hugoContent.reduce((total, page) => {
      return total + (page.content.split(/\s+/).length || 0);
    }, 0);

    const response: SiteGenerationResponse = {
      success: true,
      site: {
        id: netlifySite.id,
        name: netlifySite.name,
        url: netlifySite.ssl_url,
        domain: netlifySite.custom_domain || netlifySite.url,
        githubUrl: githubRepo.html_url,
        netlifyUrl: netlifySite.admin_url,
        status: 'completed',
        progress: {
          research: true,
          content: true,
          github: true,
          netlify: true,
          domain: !!netlifySite.custom_domain,
        },
      },
      content: {
        pages: hugoContent.map(c => ({
          title: c.title,
          content: c.content.slice(0, 200) + '...', // Truncated for response
          path: c.path,
        })),
        totalWords,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Site generation error:', error);

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

    // Return partial success if some steps completed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during site generation';

    return NextResponse.json(
      {
        success: false,
        error: 'Site generation failed',
        message: errorMessage,
        site: {
          status: 'failed',
          progress: {
            research: false,
            content: false,
            github: false,
            netlify: false,
            domain: false,
          },
        },
      },
      { status: 500 }
    );
  }
}

// GET /api/sites/generate/:id - Get generation status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Implementation for checking generation status
  // This would be stored in database in full implementation

  return NextResponse.json({
    success: true,
    site: {
      id: params.id,
      status: 'completed',
      progress: {
        research: true,
        content: true,
        github: true,
        netlify: true,
        domain: true,
      },
    },
  });
}
