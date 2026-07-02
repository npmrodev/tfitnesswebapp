import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { user, userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (!sessionCookie?.value) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to access the dashboard</p>
      </div>
    )
  }

  // Get user from database using session cookie
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, sessionCookie.value),
  })

  if (!userRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User not found. Please sign in again.</p>
      </div>
    )
  }

  // Get user role
  let role = 'member'
  try {
    const userRoleData = await db.query.userRole.findFirst({
      where: eq(userRole.userId, userRecord.id),
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
              Welcome back, {userRecord.name || userRecord.email}
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
