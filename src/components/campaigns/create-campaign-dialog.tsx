import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, MessageSquare, Users, Calendar, Target, Send, Eye, MousePointer } from 'lucide-react'
import { CampaignSegmentation, EmailCampaign, SMSCampaign } from '@/lib/communication'

interface CreateCampaignDialogProps {
  children: React.ReactNode
}

interface CampaignFormData {
  name: string
  description: string
  type: 'email' | 'sms'
  segment: CampaignSegmentation
  template: EmailTemplate | SMSTemplate | null
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
}

interface SMSTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

export function CreateCampaignDialog({ children }: CreateCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [campaignType, setCampaignType] = useState<'email' | 'sms'>('email')

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: 'email',
    segment: {
      tags: [],
      status: [],
      score: { min: undefined, max: undefined },
      source: [],
      location: '',
      daysSinceContact: undefined,
      daysSinceSignup: undefined
    },
    template: null
  })

  // Mock data
  const emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to MicroSite Forge, {{firstName}}!',
      htmlContent: '<p>Hello {{firstName}},</p><p>Thank you for your interest in {{company}}...</p>',
      variables: ['firstName', 'company']
    },
    {
      id: '2',
      name: 'Follow-up Sequence',
      subject: 'Following up on your recent inquiry',
      htmlContent: '<p>Hi {{firstName}},</p><p>We noticed you were interested...</p>',
      variables: ['firstName', 'company']
    }
  ]

  const smsTemplates: SMSTemplate[] = [
    {
      id: '1',
      name: 'Welcome SMS',
      content: 'Hi {{firstName}}! Thanks for your interest in {{company}}. Reply STOP to unsubscribe.',
      variables: ['firstName', 'company']
    },
    {
      id: '2',
      name: 'Follow-up SMS',
      content: 'Hi {{firstName}}, just checking in about your project. How can we help?',
      variables: ['firstName']
    }
  ]

  const leadSegments = [
    { id: '1', name: 'New Leads', count: 450, status: 'new' },
    { id: '2', name: 'Qualified Leads', count: 234, status: 'qualified' },
    { id: '3', name: 'High-Value Prospects', count: 89, tags: ['high-value'] },
    { id: '4', name: 'Inactive 30+ Days', count: 156, daysSinceContact: 30 }
  ]

  const handleCreateCampaign = async () => {
    try {
      // Here we would normally call an API to create the campaign
      console.log('Creating campaign:', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setOpen(false)
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'email',
        segment: {
          tags: [],
          status: [],
          score: { min: undefined, max: undefined },
          source: [],
          location: '',
          daysSinceContact: undefined,
          daysSinceSignup: undefined
        },
        template: null
      })
      setActiveTab('details')
    } catch (error) {
      console.error('Failed to create campaign:', error)
    }
  }

  const updateFormData = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateSegment = (field: keyof CampaignSegmentation, value: any) => {
    setFormData(prev => ({
      ...prev,
      segment: { ...prev.segment, [field]: value }
    }))
  }

  const selectPredefinedSegment = (segment: typeof leadSegments[0]) => {
    updateSegment('tags', segment.tags ? [segment.tags] : [])
    updateSegment('status', segment.status ? [segment.status] : [])
    updateSegment('daysSinceContact', segment.daysSinceContact)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up an automated email or SMS campaign to nurture your leads
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="segmentation">Audience</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Welcome Email Series"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="campaign-description">Description (Optional)</Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Brief description of your campaign goal"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>

              <div>
                <Label>Campaign Type</Label>
                <div className="flex space-x-4 mt-2">
                  <Card
                    className={`cursor-pointer transition-all ${
                      campaignType === 'email'
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setCampaignType('email')
                      updateFormData('type', 'email')
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">Email Campaign</h3>
                          <p className="text-sm text-gray-500">Rich HTML emails with tracking</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      campaignType === 'sms'
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setCampaignType('sms')
                      updateFormData('type', 'sms')
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-8 w-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold">SMS Campaign</h3>
                          <p className="text-sm text-gray-500">Instant text messaging</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="segmentation" className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Select Target Audience</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {leadSegments.map((segment) => (
                    <Card
                      key={segment.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => selectPredefinedSegment(segment)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{segment.name}</h4>
                            <p className="text-sm text-gray-500">{segment.count} leads</p>
                          </div>
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">Custom Segmentation</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Minimum Score</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.segment.score?.min || ''}
                      onChange={(e) => updateSegment('score', {
                        ...formData.segment.score,
                        min: e.target.value ? Number(e.target.value) : undefined
                      })}
                    />
                  </div>

                  <div>
                    <Label>Maximum Score</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.segment.score?.max || ''}
                      onChange={(e) => updateSegment('score', {
                        ...formData.segment.score,
                        max: e.target.value ? Number(e.target.value) : undefined
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Select Template</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {(campaignType === 'email' ? emailTemplates : smsTemplates).map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      formData.template?.id === template.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => updateFormData('template', template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {campaignType === 'email' && (
                          <p className="text-sm text-gray-500">
                            {(template as EmailTemplate).subject}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {campaignType === 'email'
                          ? (template as EmailTemplate).htmlContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                          : (template as SMSTemplate).content
                        }
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(campaignType === 'email' ? (template as EmailTemplate).variables : (template as SMSTemplate).variables)
                          .map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))
                        }
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {campaignType === 'email' ? (
                      <Mail className="h-5 w-5" />
                    ) : (
                      <MessageSquare className="h-5 w-5" />
                    )}
                    <span>Campaign Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Campaign Name</Label>
                      <p className="font-medium">{formData.name || 'Untitled Campaign'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Type</Label>
                      <Badge className={campaignType === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {campaignType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {formData.description && (
                    <div>
                      <Label className="text-sm text-gray-500">Description</Label>
                      <p>{formData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Target Audience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Status Filters:</span>{' '}
                      {formData.segment.status?.length
                        ? formData.segment.status.join(', ')
                        : 'None'
                      }
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Score Range:</span>{' '}
                      {formData.segment.score?.min || 0} - {formData.segment.score?.max || 100}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Source Filters:</span>{' '}
                      {formData.segment.source?.length
                        ? formData.segment.source.join(', ')
                        : 'None'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Content & Template</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.template ? (
                    <div className="space-y-2">
                      <p className="font-medium">{formData.template.name}</p>
                      {campaignType === 'email' && (
                        <p className="text-sm text-gray-600">
                          Subject: {(formData.template as EmailTemplate).subject}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No template selected</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {activeTab !== 'details' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabs = ['details', 'segmentation', 'content', 'review']
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1])
                    }
                  }}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              {activeTab === 'review' ? (
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const tabs = ['details', 'segmentation', 'content', 'review']
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1])
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
