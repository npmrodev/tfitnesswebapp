import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userRole } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar'

export default async function SettingsPage() {
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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage gym information and pricing</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gym Information */}
            <div className="lg:col-span-2 card-premium space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Gym Information</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Gym Name</label>
                  <input
                    type="text"
                    defaultValue="T-FITNESS"
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    defaultValue="contact@tfitness.com"
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Address</label>
                  <input
                    type="text"
                    defaultValue="123 Fitness Street, Gym City, GC 12345"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card-premium space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Membership Pricing</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-medium">$50.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quarterly</span>
                  <span className="font-medium">$130.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Semi-Annual</span>
                  <span className="font-medium">$240.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual</span>
                  <span className="font-medium">$450.00</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Session</span>
                    <span className="font-medium">$15.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </main>
    </div>
  )
}
