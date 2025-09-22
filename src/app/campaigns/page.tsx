import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, Mail, MessageSquare, Users, TrendingUp, Clock } from 'lucide-react'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { CreateCampaignDialog } from '@/components/campaigns/create-campaign-dialog'

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
              <p className="text-gray-600">Manage email and SMS campaigns for lead nurturing</p>
            </div>
            <CreateCampaignDialog>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </CreateCampaignDialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+180 new leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.4%</div>
              <p className="text-xs text-muted-foreground">+3.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2%</div>
              <p className="text-xs text-muted-foreground">+0.8% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CampaignList filter="all" />
          </TabsContent>

          <TabsContent value="active">
            <CampaignList filter="active" />
          </TabsContent>

          <TabsContent value="draft">
            <CampaignList filter="draft" />
          </TabsContent>

          <TabsContent value="scheduled">
            <CampaignList filter="scheduled" />
          </TabsContent>

          <TabsContent value="completed">
            <CampaignList filter="completed" />
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaign Activity</CardTitle>
              <CardDescription>Latest campaign actions and performance updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Welcome Email Series</p>
                    <p className="text-sm text-gray-500">Sent to 450 new leads • Open rate: 32%</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="mr-1 inline h-4 w-4" />2 hours ago
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Follow-up SMS Campaign</p>
                    <p className="text-sm text-gray-500">
                      Sent to 89 qualified leads • Response rate: 18%
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="mr-1 inline h-4 w-4" />5 hours ago
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Newsletter Campaign</p>
                    <p className="text-sm text-gray-500">
                      Scheduled campaign completed • 1,234 deliveries
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="mr-1 inline h-4 w-4" />1 day ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
