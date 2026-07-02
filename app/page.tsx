import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  // If logged in, go to dashboard, otherwise go to sign-in
  if (sessionCookie?.value) {
    redirect('/dashboard')
  }
  
  redirect('/sign-in')
}
