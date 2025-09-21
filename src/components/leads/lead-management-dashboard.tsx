"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Mail,
  Phone,
  MessageSquare,
  UserCheck,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash,
  Eye,
  BarChart3,
  Users,
  PhoneCall,
  Send
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { LeadData, ContactInfo, LeadScore } from '@/types/database'
import { CommunicationManager } from '@/lib/communication'



type Status = 'new' | 'qualified' | 'contacted' | 'converted'
type CommunicationType = 'email' | 'sms' | 'call' | 'note'

interface CommunicationDialogProps {
  leadId: string
  leadName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommunicationAdded: () => void
}

const CommunicationDialog: React.FC<CommunicationDialogProps> = ({
  leadId,
  leadName,
  open,
  onOpenChange,
  onCommunicationAdded
}) => {
  const [type, setType] = useState<CommunicationType>('email')
  const [content, setContent] = useState('')
  const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('communications')
        .insert({
          lead_id: leadId,
          type,
          direction,
          content,
          status: type === 'email' || type === 'sms' ? 'sent' : 'sent'
        })

      if (error) {
        logger.error('Failed to add communication', error, { leadId, type })
        alert('Failed to add communication. Please try again.')
      } else {
        logger.info('Communication added successfully', { leadId, type })
        onCommunicationAdded()
        setContent('')
        onOpenChange(false)
      }
    } catch (error) {
      logger.error('Failed to add communication', error instanceof Error ? error : new Error('Unknown error'), { leadId, type })
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Communication - {leadName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Communication Type</Label>
              <Select value={type} onValueChange={(value: string) => setType(value as CommunicationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="sms">💬 SMS</SelectItem>
                  <SelectItem value="call">📞 Call</SelectItem>
                  <SelectItem value="note">📝 Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="direction">Direction</Label>
              <Select value={direction} onValueChange={(value: string) => setDirection(value as 'inbound' | 'outbound')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter communication details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Communication'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface LeadCardProps {
  lead: LeadData
  onStatusChange: (leadId: string, status: Status) => void
  onAssign: (leadId: string, assignee: string) => void
  onCommunicationOpen: (leadId: string) => void
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onStatusChange,
  onAssign,
  onCommunicationOpen
}) => {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'qualified': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lead.contact.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{lead.contact.email}</p>
            {lead.contact.phone && (
              <p className="text-sm text-muted-foreground">{lead.contact.phone}</p>
            )}
          </div>
          <Badge className={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Score:</span>
          <span className={`font-bold ${getScoreColor(lead.score.total_score)}`}>
            {lead.score.total_score}/100
          </span>
        </div>

        <div className="flex gap-2">
          <Select value={lead.status} onValueChange={(value: string) => onStatusChange(lead.id, value as Status)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCommunicationOpen(lead.id)}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Communicate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAssign(lead.id, 'user_id')}
            className="flex-1"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface LeadManagementDashboardProps {
  userId?: string
  siteId?: string
}

export const LeadManagementDashboard: React.FC<LeadManagementDashboardProps> = ({
  userId,
  siteId
}) => {
  const [leads, setLeads] = useState<LeadData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

      if (siteId) {
        query = query.eq('site_id', siteId)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        logger.error('Failed to fetch leads', error, { userId, siteId })
        return
      }

      // Transform the data to match LeadData interface
      const transformedLeads: LeadData[] = data.map(lead => {
        // Type guard functions
        function isContactInfo(obj: any): obj is ContactInfo {
          return (
            typeof obj === "object" &&
            obj !== null &&
            "name" in obj &&
            "email" in obj &&
            typeof obj.name === "string" &&
            typeof obj.email === "string"
          )
        }

        function isLeadScore(obj: any): obj is LeadScore {
          return (
            typeof obj === "object" &&
            obj !== null &&
            "source" in obj &&
            "engagement" in obj &&
            "intent_level" in obj &&
            "budget_indicators" in obj &&
            "timeline_signals" in obj &&
            "total_score" in obj &&
            typeof obj.source === "string" &&
            typeof obj.engagement === "number" &&
            typeof obj.intent_level === "number" &&
            typeof obj.budget_indicators === "number" &&
            typeof obj.timeline_signals === "number" &&
            typeof obj.total_score === "number"
          )
        }

        let contactInfo: ContactInfo;
        if (isContactInfo(lead.contact_info)) {
          contactInfo = lead.contact_info;
        } else {
          contactInfo = {
            name: lead.name || "Unknown",
            email: lead.email,
            phone: lead.phone || undefined
          };
        }

        let leadScore: LeadScore;
        if (isLeadScore(lead.score_data)) {
          leadScore = lead.score_data;
        } else {
          leadScore = {
            source: "organic" as const,
            engagement: 0,
            intent_level: 0,
            budget_indicators: 0,
            timeline_signals: 0,
            total_score: 0
          };
        }

        const validStatuses = ["new", "qualified", "contacted", "converted"] as const;
        type StatusType = typeof validStatuses[number];
        let safeStatus: StatusType;
        if (validStatuses.includes(lead.status as any)) {
          safeStatus = lead.status as StatusType;
        } else {
          safeStatus = "new";
        }

        return {
          id: lead.id,
          contact: contactInfo,
          score: leadScore,
          tags: Array.isArray(lead.tags) ? lead.tags as string[] : [],
          status: safeStatus,
          assigned_to: lead.assigned_to,
          follow_up_date: lead.follow_up_date,
          marketing_campaign: lead.marketing_campaign,
          enriched_at: lead.enriched_at,
          created_at: lead.created_at,
          updated_at: lead.updated_at
        }
      })

      let filteredLeads = transformedLeads

      if (searchTerm) {
        filteredLeads = transformedLeads.filter(lead =>
          lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.contact.phone?.includes(searchTerm)
        )
      }

      setLeads(filteredLeads)
    } catch (error) {
      logger.error('Failed to fetch leads', error instanceof Error ? error : new Error('Unknown error'), { userId, siteId })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [userId, siteId, statusFilter])

  useEffect(() => {
    const filtered = leads.filter(lead =>
      searchTerm === '' ||
      lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.phone?.includes(searchTerm)
    )
    // Update filtered leads - for now, this triggers re-render
  }, [searchTerm, leads])

  const handleStatusChange = async (leadId: string, status: Status) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)

      if (error) {
        logger.error('Failed to update lead status', error, { leadId, status })
        alert('Failed to update lead status. Please try again.')
      } else {
        setLeads(leads.map(lead =>
          lead.id === leadId ? { ...lead, status } : lead
        ))
        logger.info('Lead status updated', { leadId, status })
      }
    } catch (error) {
      logger.error('Failed to update lead status', error instanceof Error ? error : new Error('Unknown error'), { leadId, status })
    }
  }

  const handleAssign = async (leadId: string, assignee: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          assigned_to: assignee,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) {
        logger.error('Failed to assign lead', error, { leadId, assignee })
        alert('Failed to assign lead. Please try again.')
      } else {
        setLeads(leads.map(lead =>
          lead.id === leadId ? { ...lead, assigned_to: assignee } : lead
        ))
        logger.info('Lead assigned', { leadId, assignee })
      }
    } catch (error) {
      logger.error('Failed to assign lead', error instanceof Error ? error : new Error('Unknown error'), { leadId, assignee })
    }
  }

  const handleCommunicationOpen = (leadId: string) => {
    setSelectedLead(leadId)
    setCommunicationDialogOpen(true)
  }

  const handleCommunicationAdded = () => {
    fetchLeads() // Refresh leads data
  }

  const selectedLeadData = leads.find(l => l.id === selectedLead)

  const getStatusStats = () => {
    const stats = {
      new: 0,
      qualified: 0,
      contacted: 0,
      converted: 0
    }

    leads.forEach(lead => {
      stats[lead.status]++
    })

    return stats
  }

  const statusStats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lead Management</h2>
          <p className="text-muted-foreground">
            Manage and nurture your leads effectively
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Trigger Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search leads</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Filter by status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid/List Toggle */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-muted-foreground">Loading leads...</div>
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No leads found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Leads will appear here once you have visitors filling out forms'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onStatusChange={handleStatusChange}
                  onAssign={handleAssign}
                  onCommunicationOpen={handleCommunicationOpen}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.contact.name}</TableCell>
                    <TableCell>
                      <div>
                        <div>{lead.contact.email}</div>
                        {lead.contact.phone && (
                          <div className="text-sm text-muted-foreground">{lead.contact.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        lead.score.total_score >= 70 ? 'text-green-600' :
                        lead.score.total_score >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {lead.score.total_score}/100
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'contacted' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.score.source}</TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCommunicationOpen(lead.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssign(lead.id, 'user_id')}
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Select
                          value={lead.status}
                          onValueChange={(value: string) => handleStatusChange(lead.id, value as Status)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Communication Dialog */}
      {selectedLeadData && (
        <CommunicationDialog
          leadId={selectedLead}
          leadName={selectedLeadData.contact.name}
          open={communicationDialogOpen}
          onOpenChange={setCommunicationDialogOpen}
          onCommunicationAdded={handleCommunicationAdded}
        />
      )}
    </div>
  )
}
