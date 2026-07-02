'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in via localStorage
    const token = localStorage.getItem('auth_token')
    const userId = localStorage.getItem('user_id')
    const userEmail = localStorage.getItem('user_email')
    const userName = localStorage.getItem('user_name')
    const userRole = localStorage.getItem('user_role')

    if (!token || !userId) {
      router.push('/sign-in')
      return
    }

    setUser({
      id: userId,
      email: userEmail,
      name: userName,
      role: userRole,
    })
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={user.role} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {user.role}
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
