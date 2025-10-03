const NETLIFY_API_BASE = "https://api.netlify.com/api/v1";
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  admin_url: string;
  custom_domain?: string;
  state: 'current' | 'pending_redeploy' | 'processing' | 'error';
  build_settings: {
    repo_type: string;
    repo_url: string;
    repo_branch: string;
    base: string;
    dir: string;
    cmd: string;
  };
}

/**
 * Create a new Hugo site on Netlify connected to a GitHub repository
 * @param siteName Unique site name (used for subdomain)
 * @param repoUrl GitHub repository clone URL
 * @param branch Branch to deploy from (default: 'main')
 * @param customDomain Optional custom domain for the site
 * @returns Created Netlify site information
 */
export async function createHugoSite(
  siteName: string,
  repoUrl: string,
  branch: string = "main",
  customDomain?: string
): Promise<NetlifySite> {
  if (!NETLIFY_AUTH_TOKEN) {
    throw new Error("NETLIFY_AUTH_TOKEN is not configured");
  }

  try {
    // Create the site with GitHub repository connection
    const response = await fetch(`${NETLIFY_API_BASE}/sites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: siteName,
        repo: {
          repo_type: 'git',
          repo_url: repoUrl,
          repo_branch: branch,
        },
        build_settings: {
          base: '/',
          dir: 'public',
          cmd: 'hugo --minify',
        },
        deploy_hook: null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Netlify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const site = await response.json();

    // If custom domain is provided, set it up
    if (customDomain) {
      await addCustomDomain(site.id, customDomain);
    }

    return {
      id: site.id,
      name: site.name,
      url: site.url,
      ssl_url: site.ssl_url,
      admin_url: site.admin_url,
      custom_domain: customDomain,
      state: site.state,
      build_settings: site.build_settings,
    };
  } catch (error) {
    console.error("Netlify create site error:", error);
    throw new Error(`Failed to create Netlify site: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add a custom domain to an existing Netlify site
 * @param siteId Netlify site ID
 * @param domain Custom domain to add
 * @returns Domain setup result
 */
export async function addCustomDomain(
  siteId: string,
  domain: string
): Promise<unknown> {
  if (!NETLIFY_AUTH_TOKEN) {
    throw new Error("NETLIFY_AUTH_TOKEN is not configured");
  }

  try {
    const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        certificate_type: 'managed',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Netlify domain setup error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Netlify add domain error:", error);
    // Don't throw on domain setup failure as site is already created
    console.warn(`Failed to add custom domain ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Trigger a new deployment for a Netlify site
 * @param siteId Netlify site ID
 * @param branch Optional branch to deploy (overrides default)
 * @returns Deployment trigger result
 */
export async function triggerDeployment(
  siteId: string,
  branch?: string
): Promise<unknown> {
  if (!NETLIFY_AUTH_TOKEN) {
    throw new Error("NETLIFY_AUTH_TOKEN is not configured");
  }

  try {
    const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteId}/builds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clear_cache: true,
        ...(branch && { branch }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Netlify deployment trigger error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Netlify trigger deployment error:", error);
    throw new Error(`Failed to trigger deployment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get deployment status for a Netlify site
 * @param siteId Netlify site ID
 * @returns Site deployment information
 */
export async function getSiteDeployment(siteId: string): Promise<unknown> {
  if (!NETLIFY_AUTH_TOKEN) {
    throw new Error("NETLIFY_AUTH_TOKEN is not configured");
  }

  try {
    const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteId}/deploys`, {
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify deployment status error: ${response.status} ${response.statusText}`);
    }

    const deploys = await response.json();
    return deploys[0]; // Latest deployment
  } catch (error) {
    console.error("Netlify get deployment error:", error);
    throw new Error(`Failed to get deployment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a Netlify site
 * @param siteId Netlify site ID
 */
export async function deleteSite(siteId: string): Promise<void> {
  if (!NETLIFY_AUTH_TOKEN) {
    throw new Error("NETLIFY_AUTH_TOKEN is not configured");
  }

  try {
    const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify delete site error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Netlify delete site error:", error);
    throw new Error(`Failed to delete site: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
