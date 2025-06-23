// components/dashboard/dashboard-stats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react"

interface StatsData {
  totalRevenue: number
  totalUsers: number
  totalOrders: number
  conversionRate: number
}

interface DashboardStatsProps {
  stats?: StatsData
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Helper function to format numbers with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

// Individual stat card component
interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ReactNode
  isLoading?: boolean
}

function StatCard({ title, value, change, changeType, icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </CardTitle>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1">
          {changeType === 'increase' ? (
            <ArrowUpIcon className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 text-red-500" />
          )}
          <Badge 
            variant={changeType === 'increase' ? 'default' : 'destructive'}
            className={`text-xs ${
              changeType === 'increase' 
                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                : 'bg-red-100 text-red-800 hover:bg-red-100'
            }`}
          >
            {change}
          </Badge>
          <span className="text-xs text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const isLoading = !stats

  // Mock percentage changes - in real app these would come from your API
  const changes = {
    revenue: { value: "+20.1%", type: "increase" as const },
    users: { value: "+180.1%", type: "increase" as const },
    orders: { value: "+19%", type: "increase" as const },
    conversion: { value: "+4.3%", type: "increase" as const }
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "$0.00",
      change: changes.revenue.value,
      changeType: changes.revenue.type,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: "Total Users",
      value: stats ? formatNumber(stats.totalUsers) : "0",
      change: changes.users.value,
      changeType: changes.users.type,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Total Orders",
      value: stats ? formatNumber(stats.totalOrders) : "0",
      change: changes.orders.value,
      changeType: changes.orders.type,
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      title: "Conversion Rate",
      value: stats ? `${stats.conversionRate}%` : "0%",
      change: changes.conversion.value,
      changeType: changes.conversion.type,
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          changeType={card.changeType}
          icon={card.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}