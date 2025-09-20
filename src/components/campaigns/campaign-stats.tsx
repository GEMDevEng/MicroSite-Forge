import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Users, Mail, MessageSquare, Eye, MousePointer, DollarSign } from 'lucide-react'

interface CampaignMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalLeads: number
  sentThisMonth: number
  openRate: number
  clickRate: number
  conversionRate: number
  revenueGenerated: number
  topPerformingCampaign: {
    name: string
    openRate: number
    conversions: number
  }
  deliveryRate: number
  bounceRate: number
}

interface CampaignStatsProps {
  data?: CampaignMetrics
}

// Default data
const defaultData: CampaignMetrics = {
  totalCampaigns: 8,
  activeCampaigns: 3,
  totalLeads: 1247,
  sentThisMonth: 2840,
  openRate: 28.4,
  clickRate: 8.2,
  conversionRate: 4.2,
  revenueGenerated: 15680,
  topPerformingCampaign: {
    name: 'Welcome Email Series',
    openRate: 34.2,
    conversions: 12
  },
  deliveryRate: 94.8,
  bounceRate: 2.1
}

export function CampaignStats({ data = defaultData }: CampaignStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getTrendIndicator = (current: number, previous: number) => {
    const diff = current - previous
    const percentChange = (Math.abs(diff) / previous) * 100

    if (diff > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: `+${percentChange.toFixed(1)}%`
      }
    } else {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: `${percentChange.toFixed(1)}%`
      }
    }
  }

  const TrendIndicator = ({ current, previous }: { current: number; previous: number }) => {
    const trend = getTrendIndicator(current, previous)
    const Icon = trend.icon

    return (
      <Badge className={`${trend.bgColor} ${trend.color} border-0 text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {trend.text}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalCampaigns)}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.openRate}%</div>
            <TrendIndicator current={data.openRate} previous={25.8} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.clickRate}%</div>
            <TrendIndicator current={data.clickRate} previous={7.5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenueGenerated)}</div>
            <TrendIndicator current={data.revenueGenerated} previous={12400} />
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivery Rate</span>
                <span className="font-medium">{data.deliveryRate}%</span>
              </div>
              <Progress value={data.deliveryRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bounce Rate</span>
                <span className="font-medium">{data.bounceRate}%</span>
              </div>
              <Progress value={data.bounceRate} className="h-2" />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatNumber(data.totalLeads)} total leads contacted this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{data.topPerformingCampaign.name}</h3>
                <p className="text-sm text-muted-foreground">Best performing this month</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Open Rate</span>
                  <Badge variant="secondary">{data.topPerformingCampaign.openRate}%</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Conversions</span>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    {data.topPerformingCampaign.conversions}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  +12% better than average
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Email Campaigns</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-muted-foreground">75% of total</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span className="font-medium">SMS Campaigns</span>
              </div>
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-muted-foreground">25% of total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
