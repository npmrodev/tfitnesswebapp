import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar'

export default async function CheckInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const userRoleData = await db.query.userRole.findFirst({
    where: eq(userRole.userId, session.user.id),
  })

  const role = userRoleData?.role || 'member'

  if (role !== 'owner' && role !== 'staff') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={role} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Check-In</h1>
            <p className="text-muted-foreground">QR code and manual member check-in</p>
          </div>

          <div className="card-premium space-y-4">
            <p className="text-muted-foreground">Check-in interface with QR code scanner coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
