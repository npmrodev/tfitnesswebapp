import { redirect } from 'next/navigation'

export default async function SignUpPage() {
  // Sign-up is disabled - only admin and staff can create member accounts
  redirect('/sign-in')
}
