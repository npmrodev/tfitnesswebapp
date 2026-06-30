'use client'

import { Users, TrendingUp, CheckCircle, DollarSign } from 'lucide-react'

type MetricsProps = {
  data: {
    totalMembers: number
    activeMembers: number
    expiredMembers: number
    totalRevenue: number
    todayCheckIns: number
  }
  role: string
}

export function DashboardMetrics({ data, role }: MetricsProps) {
  if (role === 'member') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          icon={<CheckCircle size={24} />}
          label="Active Membership"
          value={data.activeMembers > 0 ? 'Active' : 'Inactive'}
          color={data.activeMembers > 0 ? 'text-green-600' : 'text-muted-foreground'}
        />
        <MetricCard
          icon={<TrendingUp size={24} />}
          label="Today Check-ins"
          value={data.todayCheckIns.toString()}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        icon={<Users size={24} />}
        label="Total Members"
        value={data.totalMembers.toString()}
      />
      <MetricCard
        icon={<CheckCircle size={24} />}
        label="Active Members"
        value={data.activeMembers.toString()}
        color="text-green-600"
      />
      <MetricCard
        icon={<TrendingUp size={24} />}
        label="Expired Members"
        value={data.expiredMembers.toString()}
        color="text-orange-600"
      />
      <MetricCard
        icon={<DollarSign size={24} />}
        label="Total Revenue"
        value={`$${data.totalRevenue.toFixed(2)}`}
      />
    </div>
  )
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  color = 'text-primary' 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="card-premium space-y-4">
      <div className="flex items-center justify-between">
        <div className={`${color} opacity-80`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}
