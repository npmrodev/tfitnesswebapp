import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export default async function SignInPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  // If already logged in, redirect to dashboard
  if (sessionCookie?.value) {
    redirect('/dashboard')
  }
  
  return <AuthForm mode="sign-in" />
}
