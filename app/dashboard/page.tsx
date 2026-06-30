import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  // Get user role with error handling
  let role = 'member'
  try {
    const userRoleData = await db.query.userRole.findFirst({
      where: eq(userRole.userId, session.user.id),
    })
    role = userRoleData?.role || 'member'
  } catch (error) {
    console.error('Error fetching user role:', error)
    role = 'member'
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
            <p className="text-sm text-muted-foreground">
              Role: {role}
            </p>
          </div>

          {/* Simple placeholder content */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <p className="text-muted-foreground">
              Dashboard is loading. Please wait while we set up your data.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
