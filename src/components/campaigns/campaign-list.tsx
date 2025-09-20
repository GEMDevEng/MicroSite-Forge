'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'email' | 'sms'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
  segment: {
    name: string
    leadCount: number
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    openRate: number
    clickRate: number
  }
  createdAt: string
  scheduledFor?: string
  lastSent?: string
}

interface CampaignListProps {
  filter?: string
}

// Mock data - will be replaced with API calls
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Welcome Email Series',
    description: 'Automated welcome emails for new leads',
    type: 'email',
    status: 'active',
    segment: {
      name: 'New Leads',
      leadCount: 450
    },
    metrics: {
      sent: 350,
      delivered: 340,
      opened: 119,
      clicked: 24,
      converted: 5,
      openRate: 34.0,
      clickRate: 6.9
    },
    createdAt: '2025-01-15',
    lastSent: '2 hours ago'
  },
  {
    id: '2',
    name: 'Follow-up SMS Campaign',
    description: 'SMS reminders for inactive leads',
    type: 'sms',
    status: 'scheduled',
    segment: {
      name: 'Inactive 7+ Days',
      leadCount: 89
    },
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      openRate: 0,
      clickRate: 0
    },
    createdAt: '2025-01-16',
    scheduledFor: 'Tomorrow 10:00 AM'
  },
  {
    id: '3',
    name: 'Newsletter Q1 2025',
    description: 'Monthly newsletter for subscribers',
    type: 'email',
    status: 'completed',
    segment: {
      name: 'Newsletter Subscribers',
      leadCount: 1234
    },
    metrics: {
      sent: 1234,
      delivered: 1198,
      opened: 397,
      clicked: 89,
      converted: 12,
      openRate: 32.1,
      clickRate: 7.2
    },
    createdAt: '2025-01-10',
    lastSent: '2 days ago'
  },
  {
    id: '4',
    name: 'Product Demo Request',
    description: 'Follow-up emails for demo requests',
    type: 'email',
    status: 'draft',
    segment: {
      name: 'Demo Requests',
      leadCount: 76
    },
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      openRate: 0,
      clickRate: 0
    },
    createdAt: '2025-01-17'
  },
  {
    id: '5',
    name: 'Re-engagement SMS',
    description: 'Win back inactive users',
    type: 'sms',
    status: 'paused',
    segment: {
      name: 'Inactive 30+ Days',
      leadCount: 234
    },
    metrics: {
      sent: 156,
      delivered: 145,
      opened: 67,
      clicked: 23,
      converted: 8,
      openRate: 46.2,
      clickRate: 14.7
    },
    createdAt: '2025-01-08',
    lastSent: '5 days ago'
  }
]

export function CampaignList({ filter = 'all' }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filteredCampaigns = mockCampaigns

      if (filter !== 'all') {
        filteredCampaigns = mockCampaigns.filter(campaign => campaign.status === filter)
      }

      setCampaigns(filteredCampaigns)
      setLoading(false)
    }, 1000)
  }, [filter])

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: Campaign['type']) => {
    return type === 'email' ? (
      <Mail className="h-4 w-4 text-blue-500" />
    ) : (
      <MessageSquare className="h-4 w-4 text-green-500" />
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500">Create your first campaign to get started with lead nurturing.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getTypeIcon(campaign.type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{campaign.name}</CardTitle>
                  {campaign.description && (
                    <CardDescription className="mt-1">
                      {campaign.description}
                    </CardDescription>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusBadge(campaign.status)}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Segment Info */}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{campaign.segment.leadCount} leads</p>
                  <p className="text-xs text-gray-500">{campaign.segment.name}</p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Created {formatDate(campaign.createdAt)}</p>
                  {campaign.scheduledFor && (
                    <p className="text-xs text-blue-600">{campaign.scheduledFor}</p>
                  )}
                  {campaign.lastSent && (
                    <p className="text-xs text-gray-500">{campaign.lastSent}</p>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              {campaign.metrics.sent > 0 && (
                <>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{campaign.metrics.openRate}% open rate</p>
                      <p className="text-xs text-gray-500">{campaign.metrics.opened}/{campaign.metrics.sent} opens</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">{campaign.metrics.clickRate}% click rate</p>
                      <p className="text-xs text-gray-500">{campaign.metrics.clicked} clicks</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Last updated {formatDate(campaign.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>

                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                {campaign.status === 'draft' && (
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Launch
                  </Button>
                )}

                {campaign.status === 'active' && (
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
