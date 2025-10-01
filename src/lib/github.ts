const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  clone_url: string
  default_branch: string
  visibility: 'public' | 'private'
}

interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  type: 'file' | 'dir'
}

/**
 * Create a new repository for Hugo template
 * @param repoName Repository name
 * @param description Repository description
 * @param isPrivate Whether the repo should be private
 * @returns Created repository information
 */
export async function createHugoTemplateRepository(
  repoName: string,
  description: string = 'Hugo template for microsite generation',
  isPrivate: boolean = false
): Promise<GitHubRepo> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured')
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: isPrivate,
        auto_init: true, // Create README.md
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const repo = await response.json()
    return repo
  } catch (error) {
    console.error('GitHub create repo error:', error)
    throw new Error(
      `Failed to create repository: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get repository contents (list files/directories)
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path within repository (optional)
 * @returns Array of files and directories
 */
export async function getRepositoryContents(
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubFile[]> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured')
  }

  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const contents = await response.json()
    return Array.isArray(contents) ? contents : [contents]
  } catch (error) {
    console.error('GitHub get contents error:', error)
    throw new Error(
      `Failed to get repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Create or update a file in the repository
 * @param owner Repository owner
 * @param repo Repository name
 * @param path File path
 * @param content File content (will be base64 encoded)
 * @param message Commit message
 * @param branch Branch name
 * @returns File creation/update response
 */
export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = 'main'
): Promise<Record<string, unknown>> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured')
  }

  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`

    // Check if file exists to get SHA for update
    let sha: string | undefined
    try {
      const existingFileResponse = await fetch(url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      })
      if (existingFileResponse.ok) {
        const existingFile = await existingFileResponse.json()
        sha = existingFile.sha
      }
    } catch {
      // File doesn't exist, which is fine for creation
    }

    const body: Record<string, unknown> = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    }

    if (sha) {
      body.sha = sha // Required for updates
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('GitHub file operation error:', error)
    throw new Error(
      `Failed to create/update file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Initialize a Hugo template repository with basic structure
 * @param owner Repository owner
 * @param repo Repository name
 * @param templateConfig Hugo template configuration
 */
export async function initializeHugoTemplate(
  owner: string,
  repo: string,
  templateConfig: {
    title?: string
    baseURL?: string
    theme?: string
  } = {}
): Promise<void> {
  const { title = 'Microsite Template', baseURL = '/' } = templateConfig

  const files = [
    {
      path: 'config.toml',
      content: `[params]
  title = "${title}"
  baseURL = "${baseURL}"

[[menu.main]]
  name = "Home"
  url = "/"
  weight = 1

[[menu.main]]
  name = "About"
  url = "/about"
  weight = 2

[[menu.main]]
  name = "Contact"
  url = "/contact"
  weight = 3

[markup]
  goldmark:
    renderer:
      unsafe: true
`,
    },
    {
      path: 'content/_index.md',
      content: `---
title: "${title}"
description: "Welcome to our microsite"
draft: false
---

# Welcome

This is a Hugo-powered microsite template created for lead generation.
`,
    },
    {
      path: 'content/about/_index.md',
      content: `---
title: "About Us"
description: "Learn more about our services"
draft: false
---

# About Us

We provide exceptional services in [niche].
`,
    },
    {
      path: 'content/contact/_index.md',
      content: `---
title: "Contact Us"
description: "Get in touch with us"
draft: false
---

# Contact Us

Ready to get started? Contact us today!

<button onclick="alert('Lead capture form would go here')">Request Quote</button>
`,
    },
    {
      path: 'layouts/_default/baseof.html',
      content: `<!DOCTYPE html>
<html lang="{{ $.Site.Language.Lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ .Title }} | {{ .Site.Title }}</title>
  {{ $style := resources.Get "css/main.css" | resources.Content | resources.ExecuteAsTemplate "css/main.css" . | resources.Minify | resources.Fingerprint }}
  <link rel="stylesheet" href="{{ $style.Permalink }}">
</head>
<body>
  <div class="container">
    {{ block "main" . }}{{ end }}
  </div>
</body>
</html>`,
    },
    {
      path: 'assets/css/main.css',
      content: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.btn-primary {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #0056b3;
  text-decoration: none;
  color: white;
}`,
    },
  ]

  // Create files one by one
  for (const file of files) {
    await createOrUpdateFile(
      owner,
      repo,
      file.path,
      file.content,
      `Initialize Hugo template: ${file.path}`
    )
  }
}

/**
 * Generate Hugo site files from templates and content
 * @param owner Repository owner
 * @param repo Repository name
 * @param content Generated content for the site
 * @param config Site configuration
 */
export async function generateHugoSite(
  owner: string,
  repo: string,
  content: Array<{
    path: string
    content: string
    title: string
  }>,
  config: {
    siteTitle: string
    domain: string
    description?: string
  }
): Promise<void> {
  // Update site config
  const configContent = `[params]
  title = "${config.siteTitle}"
  description = "${config.description || ''}"
  baseURL = "https://${config.domain}"

[[menu.main]]
  name = "Home"
  url = "/"
  weight = 1

[[menu.main]]
  name = "Services"
  url = "/services"
  weight = 2

[[menu.main]]
  name = "About"
  url = "/about"
  weight = 3

[[menu.main]]
  name = "Contact"
  url = "/contact"
  weight = 4

[markup]
  goldmark:
    renderer:
      unsafe: true
`

  await createOrUpdateFile(owner, repo, 'config.toml', configContent, 'Update site configuration')

  // Create content files
  for (const item of content) {
    await createOrUpdateFile(owner, repo, item.path, item.content, `Add content: ${item.title}`)
  }
}

/**
 * Trigger GitHub Pages deployment (if Pages is enabled)
 * @param owner Repository owner
 * @param repo Repository name
 */
export async function triggerGitHubPagesDeployment(owner: string, repo: string): Promise<void> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured')
  }

  try {
    // Create a workflow dispatch to trigger deployment
    const workflowResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/pages/pages-build-deployment/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main', // branch to deploy from
        }),
      }
    )

    if (!workflowResponse.ok && workflowResponse.status !== 204) {
      throw new Error(`GitHub Pages deployment trigger failed: ${workflowResponse.status}`)
    }
  } catch (error) {
    console.error('GitHub Pages deployment error:', error)
    // Don't throw error for Pages deployment as it might not be enabled
  }
}
