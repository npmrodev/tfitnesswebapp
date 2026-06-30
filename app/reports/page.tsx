import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar'

export default async function ReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const userRoleData = await db.query.userRole.findFirst({
    where: eq(userRole.userId, session.user.id),
  })

  const role = userRoleData?.role || 'member'

  if (role !== 'owner') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={role} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and export business reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-premium space-y-4 cursor-pointer hover:border-primary transition-colors">
              <h3 className="font-semibold text-foreground">Daily Transactions</h3>
              <p className="text-sm text-muted-foreground">Export today's transactions</p>
            </div>
            <div className="card-premium space-y-4 cursor-pointer hover:border-primary transition-colors">
              <h3 className="font-semibold text-foreground">Weekly Transactions</h3>
              <p className="text-sm text-muted-foreground">Export this week's transactions</p>
            </div>
            <div className="card-premium space-y-4 cursor-pointer hover:border-primary transition-colors">
              <h3 className="font-semibold text-foreground">Monthly Transactions</h3>
              <p className="text-sm text-muted-foreground">Export this month's transactions</p>
            </div>
            <div className="card-premium space-y-4 cursor-pointer hover:border-primary transition-colors">
              <h3 className="font-semibold text-foreground">Attendance History</h3>
              <p className="text-sm text-muted-foreground">Member check-in records</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
