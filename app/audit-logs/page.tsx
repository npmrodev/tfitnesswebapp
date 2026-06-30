import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userRole, auditLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar'

export default async function AuditLogsPage() {
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

  // Get audit logs
  const logs = await db.query.auditLog.findMany({
    orderBy: desc(auditLog.createdAt),
    limit: 100,
  })

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-700 border-blue-300'
    if (action.includes('LOGOUT')) return 'bg-gray-100 text-gray-700 border-gray-300'
    if (action.includes('PAYMENT')) return 'bg-green-100 text-green-700 border-green-300'
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-300'
    if (action.includes('CREATE')) return 'bg-purple-100 text-purple-700 border-purple-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={role} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Track all system activities and changes</p>
          </div>

          <div className="bg-card border border-border overflow-x-auto">
            {logs.length > 0 ? (
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Performed By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Details</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 border text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {log.performedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {log.details || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No audit logs yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
