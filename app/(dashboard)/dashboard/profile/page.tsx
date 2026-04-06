import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { ProfileClient } from './page-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Driver Profile | Movely',
  description: 'Manage your driver profile'
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await DriverService.getProfile(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      <ProfileClient profile={profile} />
    </div>
  )
}
