'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { KeywordSuggestion } from '@/lib/grok'

// Define interfaces for the dashboard data
interface DomainCheckResult {
  domain: string
  price?: number
  available: boolean
}

interface ResearchData {
  niche: string
  keywords: KeywordSuggestion[]
  recommendedDomain?: string
  trendingTopics?: string[]
  contentOpportunities?: string[]
  competitorInsights?: string[]
  availableDomains?: DomainCheckResult[]
}

interface AnalyticsOverview {
  totalSites: number
  totalLeads: number
  totalRevenue: number
  conversionRate?: number
  qualifiedLeads?: number
  activeSites?: number
}

interface AnalyticsData {
  overview?: AnalyticsOverview
}

interface ContentItem {
  title: string
  content: string
  metaDescription: string
  seoKeywords: string[]
  path?: string
  validation: {
    score: number
    issues: string[]
    wordCount: number
    passed: boolean
  }
}

interface Site {
  id?: string
  name: string
  siteTitle?: string
  domain?: string
  status: string
  url?: string
  githubUrl?: string
  content?: {
    pages?: ContentItem[]
    totalWords?: number
  }
  progress?: Record<string, boolean>
  created_at?: string
}
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NicheResearch from '@/components/research/niche-research'
import ContentEditor from '@/components/content/content-editor'
import { Search, FileText, Cloud, TrendingUp, Globe, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut, loading, initialized, initialize } = useAuthStore()

  // All hooks must be called before any early returns
  const [activeTab, setActiveTab] = useState('overview')
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [isGeneratingSite, setIsGeneratingSite] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, initialized, router])

  useEffect(() => {
    if (user && initialized) {
      const fetchAnalytics = async () => {
        setLoadingAnalytics(true)
        try {
          const response = await fetch('/api/analytics')
          if (response.ok) {
            const data = await response.json()
            setAnalyticsData(data)
          }
        } catch (error) {
          console.error('Failed to fetch analytics:', error)
        } finally {
          setLoadingAnalytics(false)
        }
      }
      fetchAnalytics()
    }
  }, [user, initialized])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'research', label: 'Niche Research', icon: Search },
    { id: 'content', label: 'Content Gen', icon: FileText },
    { id: 'sites', label: 'My Sites', icon: Cloud },
  ]

  const handleResearchComplete = (data: ResearchData) => {
    setResearchData(data)
    console.log('Research completed:', data)
  }

  const handleContentUpdate = (index: number, updatedContent: ContentItem) => {
    const updated = [...generatedContent]
    updated[index] = updatedContent
    setGeneratedContent(updated)
  }

  const handleRegenerateContent = async (index: number) => {
    if (!researchData) return

    try {
      const contentRequests = [
        {
          keyword: `${researchData.niche} services`,
          contentType: 'blog-post' as const,
          niche: researchData.niche,
          targetAudience: 'general',
          tone: 'professional',
          wordCount: 800,
        },
      ]

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentRequests[0]),
      })

      if (response.ok) {
        const data = await response.json()
        const updated = [...generatedContent]
        updated[index] = data.data
        setGeneratedContent(updated)
      }
    } catch (error) {
      console.error('Content regeneration failed:', error)
    }
  }

  const handleApproveContent = async (content: ContentItem[]) => {
    if (!researchData || !content.length) return

    setIsGeneratingSite(true)
    try {
      const recommendedDomain = researchData.recommendedDomain
      if (!recommendedDomain) {
        alert('No domain available for site generation')
        return
      }

      const siteRequest = {
        niche: researchData.niche,
        domain: recommendedDomain,
        siteTitle: `${researchData.niche} Services - Professional Solutions`,
        description: `Professional ${researchData.niche} services for all your needs.`,
        keywords: researchData.keywords?.slice(0, 5).map((k) => k.keyword) || [researchData.niche],
        targetAudience: 'general',
        tone: 'professional',
        githubRepoName: `microsite-${researchData.niche.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      }

      const response = await fetch('/api/sites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteRequest),
      })

      if (response.ok) {
        const data = await response.json()
        setSites((prev) => [...prev, data.site])
        setActiveTab('sites')
      } else {
        const error = await response.json()
        alert(`Site generation failed: ${error.message || error.error}`)
      }
    } catch (error) {
      console.error('Site generation failed:', error)
      alert('Site generation failed. Please try again.')
    } finally {
      setIsGeneratingSite(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🚀 MicroSite Forge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {loadingAnalytics ? (
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="animate-pulse">
                          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                          <div className="mb-2 h-8 w-1/2 rounded bg-gray-200"></div>
                          <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Sites Created
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-600">
                        {analyticsData?.overview?.totalSites || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {analyticsData?.overview?.totalSites === 0
                          ? 'Ready to create your first microsite'
                          : 'Microsites deployed'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Leads Generated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData?.overview?.totalLeads || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {analyticsData?.overview?.qualifiedLeads
                          ? `${analyticsData.overview.qualifiedLeads} qualified`
                          : 'Start with niche research'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-600">
                        ${analyticsData?.overview?.totalRevenue?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {analyticsData?.overview?.conversionRate
                          ? `${analyticsData.overview.conversionRate.toFixed(1)}% conversion`
                          : 'Get started with lead generation'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'research' && (
            <div>
              <NicheResearch onResearchComplete={handleResearchComplete} />
              {researchData && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Research completed for: <strong>{researchData.niche}</strong>
                      </p>
                      <Button
                        onClick={() => setActiveTab('content')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Generate Content →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <>
              {!researchData ? (
                <Card>
                  <CardContent className="py-16 pt-6 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      Research First Required
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      You need to complete niche research before generating content.
                    </p>
                    <Button onClick={() => setActiveTab('research')} variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Go to Research
                    </Button>
                  </CardContent>
                </Card>
              ) : generatedContent.length === 0 ? (
                <Card>
                  <CardContent className="py-16 pt-6 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Content Generation</h3>
                    <p className="mb-6 text-sm text-gray-500">
                      Generate AI-powered content for your {researchData.niche} microsite.
                    </p>
                    <Button
                      onClick={async () => {
                        try {
                          const contentRequests = [
                            {
                              keyword: `${researchData.niche} services`,
                              contentType: 'landing-page' as const,
                              niche: researchData.niche,
                              targetAudience: 'general',
                              tone: 'professional',
                              wordCount: 800,
                            },
                            {
                              keyword: `about ${researchData.niche}`,
                              contentType: 'blog-post' as const,
                              niche: researchData.niche,
                              targetAudience: 'general',
                              tone: 'professional',
                              wordCount: 600,
                            },
                            {
                              keyword: `${researchData.niche} contact`,
                              contentType: 'blog-post' as const,
                              niche: researchData.niche,
                              targetAudience: 'general',
                              tone: 'professional',
                              wordCount: 400,
                            },
                          ]

                          const responses = await Promise.all(
                            contentRequests.map((req) =>
                              fetch('/api/content', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(req),
                              })
                            )
                          )

                          const contents = await Promise.all(
                            responses.map(async (res, i) => {
                              if (res.ok) {
                                const data = await res.json()
                                return {
                                  ...data.data,
                                  path: [
                                    'content/_index.md',
                                    'content/about/_index.md',
                                    'content/contact/_index.md',
                                  ][i],
                                }
                              }
                              return null
                            })
                          )

                          setGeneratedContent(contents.filter(Boolean))
                        } catch (error) {
                          console.error('Content generation failed:', error)
                          alert('Content generation failed. Please try again.')
                        }
                      }}
                      disabled={isGeneratingSite}
                    >
                      {isGeneratingSite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ContentEditor
                  content={generatedContent}
                  onContentUpdate={handleContentUpdate}
                  onRegenerateContent={handleRegenerateContent}
                  onApproveContent={handleApproveContent}
                  keyword={`${researchData.niche} services`}
                  niche={researchData.niche}
                />
              )}
            </>
          )}

          {activeTab === 'sites' && (
            <div>
              {sites.length === 0 ? (
                <Card>
                  <CardContent className="py-16 pt-6 text-center">
                    <Cloud className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      No Sites Created Yet
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Your published microsites will appear here once you complete the research and
                      content steps.
                    </p>
                    <Button onClick={() => setActiveTab('research')} variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Start Your First Site
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Your Microsites ({sites.length})
                      </CardTitle>
                      <CardDescription>
                        All your published microsites are listed below
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="truncate text-lg" title={site.name}>
                              {site.siteTitle || site.name}
                            </CardTitle>
                            <Badge
                              variant={
                                site.status === 'completed'
                                  ? 'default'
                                  : site.status === 'deploying'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {site.status}
                            </Badge>
                          </div>
                          <CardDescription className="truncate" title={site.domain}>
                            {site.domain}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Pages:</span>
                            <span>{site.content?.pages?.length || 0}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Words:</span>
                            <span>{site.content?.totalWords || 0}</span>
                          </div>

                          <div className="space-y-2">
                            {site.progress && (
                              <>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Progress:</span>
                                  <span>
                                    {Object.values(site.progress).filter(Boolean).length}/5
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{
                                      width: `${(Object.values(site.progress).filter(Boolean).length / 5) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.open(site.url, '_blank')}
                              disabled={!site.url}
                            >
                              <Globe className="mr-1 h-4 w-4" />
                              View Site
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(site.githubUrl, '_blank')}
                              disabled={!site.githubUrl}
                            >
                              GitHub
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
