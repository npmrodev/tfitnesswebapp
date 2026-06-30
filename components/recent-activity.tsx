'use client'

import { Clock } from 'lucide-react'

type RecentActivityProps = {
  memberData: any
  role: string
}

export function RecentActivity({ memberData, role }: RecentActivityProps) {
  if (role === 'member' && memberData) {
    const recentCheckIns = memberData.checkIns.slice(0, 5)

    return (
      <div className="card-premium space-y-4">
        <div className="flex items-center gap-3">
          <Clock size={20} />
          <h2 className="text-lg font-semibold text-foreground">Recent Check-ins</h2>
        </div>

        {recentCheckIns.length > 0 ? (
          <div className="space-y-2">
            {recentCheckIns.map((checkIn, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Check-in</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(checkIn.checkInTime).toLocaleDateString()} at {new Date(checkIn.checkInTime).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 border border-green-300">
                  {checkIn.method === 'qr' ? 'QR' : 'Manual'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No check-ins yet</p>
        )}
      </div>
    )
  }

  return (
    <div className="card-premium space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Activity Status</h2>
      <p className="text-sm text-muted-foreground">
        {role === 'owner' 
          ? 'Access detailed activity logs in the Audit Logs section'
          : 'Stay active and track your gym progress'}
      </p>
    </div>
  )
}
