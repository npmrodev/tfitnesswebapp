'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in via localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/sign-in')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}
