import { db } from '../lib/db'
import { user, userRole, member, account, session } from '../lib/db/schema'
import { auth } from '../lib/auth'
import { eq } from 'drizzle-orm'

async function createAccount(accountInfo: { email: string; password: string; name: string; role: string; firstName: string; lastName: string }) {
  const { email, password, name, role, firstName, lastName } = accountInfo
  
  console.log(`Checking if ${role} (${email}) exists...`)
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  })
  
  if (existingUser) {
    console.log(`${role} already exists, deleting...`)
    await db.delete(session).where(eq(session.userId, existingUser.id))
    await db.delete(userRole).where(eq(userRole.userId, existingUser.id))
    await db.delete(member).where(eq(member.userId, existingUser.id))
    await db.delete(account).where(eq(account.userId, existingUser.id))
    await db.delete(user).where(eq(user.id, existingUser.id))
    console.log(`Existing ${role} deleted`)
  }
  
  console.log(`Creating new ${role} account...`)
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  })
  
  if ((result as any).error) {
    console.error(`Error creating ${role}:`, (result as any).error)
    return null
  }
  
  if ((result as any).data?.user) {
    const userId = (result as any).data.user.id
    
    console.log(`Setting ${role} role...`)
    await db.insert(userRole).values({
      userId,
      role,
    })
    
    console.log(`Creating member profile...`)
    await db.insert(member).values({
      userId,
      firstName,
      lastName,
      email,
      status: 'active',
    })
    
    console.log(`✅ ${role} account created successfully!`)
    return { email, password, role }
  }
  
  return null
}

async function createAdminAndStaffAccounts() {
  try {
    const accounts = [
      {
        email: 'admin@tfitness.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'owner',
        firstName: 'Admin',
        lastName: 'User',
      },
      {
        email: 'staff@tfitness.com',
        password: 'Staff@123',
        name: 'Staff User',
        role: 'staff',
        firstName: 'Staff',
        lastName: 'User',
      },
    ]
    
    console.log('=== Creating Admin and Staff Accounts ===\n')
    
    for (const accountInfo of accounts) {
      const result = await createAccount(accountInfo)
      if (result) {
        console.log(`Email: ${result.email}`)
        console.log(`Password: ${result.password}`)
        console.log(`Role: ${result.role}\n`)
      }
    }
    
    console.log('=== All accounts created successfully! ===')
    console.log('You can now log in at:')
    console.log('- Local: http://localhost:3000/sign-in')
    console.log('- Production: https://tfitnesswebapp.vercel.app/sign-in')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createAdminAndStaffAccounts()
