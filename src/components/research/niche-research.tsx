'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, Lightbulb, AlertCircle, DollarSign } from 'lucide-react'

// Types
interface KeywordSuggestion {
  keyword: string
  searchVolume: number
  competition: 'high' | 'medium' | 'low'
  cpc: number
  trending: boolean
}

interface ResearchResponse {
  niche: string
  keywords: KeywordSuggestion[]
  trendingTopics: string[]
  contentOpportunities: string[]
  competitorInsights?: string[]
  availableDomains: any[]
  recommendedDomain?: string
  estimatedCost?: number
}

interface NicheResearchProps {
  onResearchComplete?: (data: ResearchResponse) => void
}

export default function NicheResearch({ onResearchComplete }: NicheResearchProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    niche: '',
    targetAudience: '',
    geography: '',
    competitorAnalysis: false,
    domainSearch: true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const performResearch = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxDomains: 10,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to perform research')
      }

      const data = await response.json()
      setResults(data.data)
      onResearchComplete?.(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Niche Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="niche">Niche/Business Type</Label>
              <Input
                id="niche"
                placeholder="e.g., electricians, plumbers, dentists"
                value={formData.niche}
                onChange={(e) => handleInputChange('niche', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., homeowners, businesses, millennials"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="geography">Geography (Optional)</Label>
              <Input
                id="geography"
                placeholder="e.g., San Francisco, California, USA"
                value={formData.geography}
                onChange={(e) => handleInputChange('geography', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="competitorAnalysis"
                checked={formData.competitorAnalysis}
                onCheckedChange={(checked) => handleInputChange('competitorAnalysis', checked)}
              />
              <Label htmlFor="competitorAnalysis">Include competitor analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="domainSearch"
                checked={formData.domainSearch}
                onCheckedChange={(checked) => handleInputChange('domainSearch', checked)}
              />
              <Label htmlFor="domainSearch">Check domain availability</Label>
            </div>
          </div>

          <Button
            onClick={performResearch}
            disabled={!formData.niche.trim() || loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Researching...' : 'Perform Research'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.keywords.slice(0, 10).map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{keyword.keyword}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{keyword.searchVolume.toLocaleString()} searches</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getCompetitionColor(keyword.competition)}`}>
                          {keyword.competition}
                        </span>
                        {keyword.trending && <Badge variant="secondary">Trending</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${keyword.cpc}</p>
                      <p className="text-xs text-gray-500">CPC</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Content Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.contentOpportunities.slice(0, 5).map((opportunity, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">{opportunity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Domain Results */}
          {results.availableDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Available Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.recommendedDomain && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">Recommended Domain</p>
                    <p className="text-lg font-bold text-green-900">{results.recommendedDomain}</p>
                    {results.estimatedCost && (
                      <p className="text-sm text-green-700">
                        Estimated cost: ${results.estimatedCost}/year
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  {results.availableDomains.slice(0, 5).map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{domain.domain}</span>
                      {domain.price && (
                        <span className="text-sm text-green-600">${domain.price}/year</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor Insights */}
          {results.competitorInsights && results.competitorInsights.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Competitor Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.competitorInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
