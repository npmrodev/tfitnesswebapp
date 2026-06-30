import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar'
import { MembersManagement } from '@/components/members-management'

export default async function MembersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  // Check user role
  const userRoleData = await db.query.userRole.findFirst({
    where: eq(userRole.userId, session.user.id),
  })

  const role = userRoleData?.role || 'member'

  // Only owner and staff can access
  if (role !== 'owner' && role !== 'staff') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={role} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground">Manage gym members and their information</p>
          </div>

          <MembersManagement role={role} canCreateMembers={role === 'owner'} />
        </div>
      </main>
    </div>
  )
}
