import { db } from '@/lib/db'
import { gymSetting } from '@/lib/db/schema'

export async function getGymSettings() {
  const settings = await db.query.gymSetting.findFirst()
  if (!settings) {
    await db.insert(gymSetting).values({
      gymName: 'T-FITNESS',
      monthlyPrice: '50.00',
      quarterlyPrice: '130.00',
      semiAnnualPrice: '240.00',
      annualPrice: '450.00',
      perSessionPrice: '15.00',
      guestPassPrice: '20.00',
      weekPassPrice: '80.00',
      twoWeekPassPrice: '150.00',
    })
    return getGymSettings()
  }
  return settings
}

export function calculateMembershipEndDate(startDate: Date, type: string): Date {
  const end = new Date(startDate)
  switch (type) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1)
      break
    case 'quarterly':
      end.setMonth(end.getMonth() + 3)
      break
    case 'semi-annual':
      end.setMonth(end.getMonth() + 6)
      break
    case 'annual':
      end.setFullYear(end.getFullYear() + 1)
      break
    case '1-week':
      end.setDate(end.getDate() + 7)
      break
    case '2-week':
      end.setDate(end.getDate() + 14)
      break
    case 'guest':
      end.setDate(end.getDate() + 1)
      break
  }
  return end
}

export function isMembershipExpired(endDate: Date | null): boolean {
  if (!endDate) return false
  return new Date() > endDate
}

export function getMembershipDaysRemaining(endDate: Date | null): number {
  if (!endDate) return 0
  const now = new Date()
  if (now > endDate) return 0
  const diff = endDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
