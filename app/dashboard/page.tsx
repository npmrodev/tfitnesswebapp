import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userRole, member, membership, checkIn, payment } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { DashboardMetrics } from '@/components/dashboard-metrics'
import { RecentActivity } from '@/components/recent-activity'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  // Get user role
  const userRoleData = await db.query.userRole.findFirst({
    where: eq(userRole.userId, session.user.id),
  })

  const role = userRoleData?.role || 'member'

  // Get member info
  const memberData = await db.query.member.findFirst({
    where: eq(member.userId, session.user.id),
    with: {
      memberships: true,
      checkIns: true,
    },
  })

  // Get dashboard data based on role
  let dashboardData = {
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalRevenue: 0,
    todayCheckIns: 0,
    recentActivities: [] as any[],
  }

  if (role === 'owner') {
    // Owner dashboard
    const allMembers = await db.query.member.findMany({
      with: {
        memberships: true,
      },
    })

    const allCheckIns = await db.query.checkIn.findMany()
    const allPayments = await db.query.payment.findMany()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCheckInList = allCheckIns.filter(ci => {
      const ciDate = new Date(ci.checkInTime)
      ciDate.setHours(0, 0, 0, 0)
      return ciDate.getTime() === today.getTime()
    })

    const activeMemsList = allMembers.filter(m => m.status === 'active')
    const expiredMemsList = allMembers.filter(m => {
      return m.memberships.some(ms => {
        if (!ms.endDate) return false
        return new Date() > ms.endDate && ms.status === 'active'
      })
    })

    const totalRevenueAmount = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)

    dashboardData = {
      totalMembers: allMembers.length,
      activeMembers: activeMemsList.length,
      expiredMembers: expiredMemsList.length,
      totalRevenue: totalRevenueAmount,
      todayCheckIns: todayCheckInList.length,
      recentActivities: [],
    }
  } else if (role === 'staff') {
    // Staff dashboard
    const allMembers = await db.query.member.findMany()
    const allCheckIns = await db.query.checkIn.findMany()
    const allPayments = await db.query.payment.findMany()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCheckInList = allCheckIns.filter(ci => {
      const ciDate = new Date(ci.checkInTime)
      ciDate.setHours(0, 0, 0, 0)
      return ciDate.getTime() === today.getTime()
    })

    dashboardData = {
      totalMembers: allMembers.length,
      activeMembers: allMembers.filter(m => m.status === 'active').length,
      expiredMembers: 0,
      totalRevenue: allPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      todayCheckIns: todayCheckInList.length,
      recentActivities: [],
    }
  } else {
    // Member dashboard
    if (memberData) {
      const activeMembership = memberData.memberships.find(m => m.status === 'active')
      const todayCheckIns = memberData.checkIns.filter(ci => {
        const ciDate = new Date(ci.checkInTime)
        const today = new Date()
        return ciDate.toDateString() === today.toDateString()
      }).length

      dashboardData = {
        totalMembers: 1,
        activeMembers: activeMembership ? 1 : 0,
        expiredMembers: 0,
        totalRevenue: 0,
        todayCheckIns: todayCheckIns,
        recentActivities: [],
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={role} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>

          {/* Metrics */}
          <DashboardMetrics 
            data={dashboardData}
            role={role}
          />

          {/* Recent Activity */}
          <RecentActivity 
            memberData={memberData}
            role={role}
          />
        </div>
      </main>
    </div>
  )
}
