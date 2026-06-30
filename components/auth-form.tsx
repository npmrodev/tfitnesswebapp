'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import Image from 'next/image'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message ?? 'Something went wrong')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary flex items-center justify-center border border-primary">
              <span className="text-primary-foreground font-bold text-3xl">T</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">T-FITNESS</h1>
            <p className="text-sm text-muted-foreground mt-1">Gym Management System</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? 'Create your account to get started'
                : 'Welcome back. Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="input-field w-full"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field w-full"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="input-field w-full"
                placeholder="Enter your password"
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Loading...'
                : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                {isSignUp ? 'Already have an account?' : 'New to T-FITNESS?'}
              </span>
            </div>
          </div>

          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="btn-outline w-full text-center"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </Link>
        </div>

        {/* Test Credentials */}
        <div className="bg-secondary/50 border border-border p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground">Test Credentials</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Owner: admin@tfitness.com / Password123</p>
            <p>Staff: staff@tfitness.com / Password123</p>
            <p>Member: member@tfitness.com / Password123</p>
          </div>
        </div>
      </div>
    </main>
  )
}
