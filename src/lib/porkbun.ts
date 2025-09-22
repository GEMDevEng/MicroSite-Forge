const PORKBUN_API_BASE = 'https://api.porkbun.com/api/json/v3'
const API_KEY = process.env.PORKBUN_API_KEY
const SECRET_KEY = process.env.PORKBUN_SECRET_KEY

interface DomainCheckResult {
  domain: string
  status: 'available' | 'registered' | 'error'
  price?: number
  premium?: boolean
  message?: string
}

/**
 * Check domain availability using Porkbun API
 * @param domains Array of domain names to check
 * @returns Array of availability results
 */
export async function checkDomainAvailability(domains: string[]): Promise<DomainCheckResult[]> {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('PORKBUN_API_KEY and PORKBUN_SECRET_KEY are required')
  }

  if (domains.length === 0) {
    throw new Error('At least one domain must be provided')
  }

  if (domains.length > 100) {
    throw new Error('Cannot check more than 100 domains at once')
  }

  try {
    const response = await fetch(`${PORKBUN_API_BASE}/domain/checkAvailability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: API_KEY,
        secretapikey: SECRET_KEY,
        domains: domains,
      }),
    })

    if (!response.ok) {
      throw new Error(`Porkbun API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check for API errors
    if (data.error) {
      throw new Error(`Porkbun API error: ${data.error}`)
    }

    const results: DomainCheckResult[] = domains.map((domain) => {
      const checkResponse = data.check[domain]

      if (checkResponse?.status === 'SUCCESS') {
        return {
          domain,
          status: checkResponse.price ? 'available' : 'registered',
          price: checkResponse.price ? parseFloat(checkResponse.price) : undefined,
          premium: checkResponse?.premium || false,
        }
      } else {
        return {
          domain,
          status: 'error',
          message: checkResponse?.error || 'Unknown error',
        }
      }
    })

    return results
  } catch (error) {
    console.error('Porkbun domain check error:', error)
    throw new Error(
      `Failed to check domain availability: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Check availability of domain variations for a keyword
 * @param keyword Base keyword for domain generation
 * @param tlds Array of TLDs to check (default: ['.com', '.net', '.org'])
 * @returns Array of availability results
 */
export async function checkKeywordDomainVariations(
  keyword: string,
  tlds: string[] = ['.com', '.net', '.org']
): Promise<DomainCheckResult[]> {
  const domains: string[] = []

  // Clean keyword for domain use
  const cleanKeyword = keyword
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '')

  if (!cleanKeyword || cleanKeyword.length < 2) {
    throw new Error('Keyword must be at least 2 characters and contain alphanumeric characters')
  }

  // Generate domain variations
  const variations = [
    cleanKeyword,
    `${cleanKeyword}pro`,
    `${cleanKeyword}hub`,
    `${cleanKeyword}zone`,
    `get${cleanKeyword}`,
    `my${cleanKeyword}`,
    `${cleanKeyword}now`,
  ]

  // Generate all combinations
  variations.forEach((variation) => {
    tlds.forEach((tld) => {
      const domain = variation + tld
      if (!domains.includes(domain)) {
        domains.push(domain)
      }
    })
  })

  // Limit to 100 domains (Porkbun limit)
  const limitedDomains = domains.slice(0, 100)

  return await checkDomainAvailability(limitedDomains)
}

/**
 * Find available domains for a given niche/keyword
 * @param keyword Base keyword
 * @param budget Max budget per domain (optional)
 * @returns Filtered list of available, affordable domains
 */
export async function findAvailableDomains(
  keyword: string,
  budget?: number
): Promise<DomainCheckResult[]> {
  const results = await checkKeywordDomainVariations(keyword)

  // Filter available domains only
  const available = results.filter((result) => result.status === 'available')

  // Filter by budget if specified
  if (budget) {
    return available.filter((result) => result.price && result.price <= budget)
  }

  return available
}
