'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    console.log('Attempting to sign in...', { email, isSignUp })

    try {
      // Use server-side API for login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Response status:', response.status)

      const result = await response.json()
      console.log('Login API result:', result)

      setLoading(false)

      if (!response.ok || result.error) {
        setError(result.error || 'Something went wrong')
        console.error('Login failed:', result.error)
        return
      }

      console.log('Sign in successful, redirecting to dashboard')
      
      // Show success message
      setSuccess('Login successful! Redirecting...')
      
      // Use window.location.replace for immediate redirect
      window.location.replace('/dashboard')
    } catch (err) {
      console.error('Sign in error:', err)
      setLoading(false)
      setError('Network error. Please check your connection and try again.')
    }
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

            {success && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 text-sm p-3">
                {success}
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

          {!isSignUp && (
            <div className="text-center text-sm text-muted-foreground">
              Contact admin to create a new account
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
