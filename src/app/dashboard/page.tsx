'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
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
  const [researchData, setResearchData] = useState<any>(null)
  const [generatedContent, setGeneratedContent] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [isGeneratingSite, setIsGeneratingSite] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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

  const handleResearchComplete = (data: any) => {
    setResearchData(data)
    console.log('Research completed:', data)
  }

  const handleContentUpdate = (index: number, updatedContent: any) => {
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

  const handleApproveContent = async (content: any[]) => {
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
        keywords: researchData.keywords?.slice(0, 5).map((k: any) => k.keyword) || [researchData.niche],
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
        setSites(prev => [...prev, data.site])
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 MicroSite Forge
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    Sites Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600">Ready to create your first microsite</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Leads Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-600">Start with niche research</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">$0</p>
                  <p className="text-sm text-gray-600">Get started with Phase 2</p>
                </CardContent>
              </Card>
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
                  <CardContent className="pt-6 text-center py-16">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Research First Required</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      You need to complete niche research before generating content.
                    </p>
                    <Button onClick={() => setActiveTab('research')} variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Go to Research
                    </Button>
                  </CardContent>
                </Card>
              ) : generatedContent.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-16">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Content Generation</h3>
                    <p className="text-sm text-gray-500 mb-6">
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
                          ];

                          const responses = await Promise.all(
                            contentRequests.map(req =>
                              fetch('/api/content', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(req),
                              })
                            )
                          );

                          const contents = await Promise.all(
                            responses.map(async (res, i) => {
                              if (res.ok) {
                                const data = await res.json();
                                return {
                                  ...data.data,
                                  path: ['content/_index.md', 'content/about/_index.md', 'content/contact/_index.md'][i],
                                };
                              }
                              return null;
                            })
                          );

                          setGeneratedContent(contents.filter(Boolean));
                        } catch (error) {
                          console.error('Content generation failed:', error);
                          alert('Content generation failed. Please try again.');
                        }
                      }}
                      disabled={isGeneratingSite}
                    >
                      {isGeneratingSite && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
                  <CardContent className="pt-6 text-center py-16">
                    <Cloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">No Sites Created Yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Your published microsites will appear here once you complete the research and content steps.
                    </p>
                    <Button onClick={() => setActiveTab('research')} variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Start Your First Site
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cloud className="w-5 h-5" />
                        Your Microsites ({sites.length})
                      </CardTitle>
                      <CardDescription>
                        All your published microsites are listed below
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg truncate" title={site.name}>
                              {site.siteTitle || site.name}
                            </CardTitle>
                            <Badge
                              variant={
                                site.status === 'completed' ? 'default' :
                                site.status === 'deploying' ? 'secondary' : 'destructive'
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
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${(Object.values(site.progress).filter(Boolean).length / 5) * 100}%`
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
                              <Globe className="w-4 h-4 mr-1" />
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
