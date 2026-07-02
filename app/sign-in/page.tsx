'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  return <AuthForm mode="sign-in" />
}
