import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { logout } from '@/modules/auth/actions/logout'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DriverService } from '@/modules/drivers/services/driver.service'
import Link from 'next/link'
import Image from 'next/image'

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const profile = await DriverService.getProfile(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {params.error === 'unauthorized' && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            You don't have permission to access the admin panel.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Sign out
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Movely</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.role}
            </div>
            <div>
              <span className="font-medium">Account created:</span>{' '}
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Profile</CardTitle>
            <CardDescription>
              {profile ? 'Your driver profile' : 'Create your driver profile to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <>
                {profile.profileImageUrl && (
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={profile.profileImageUrl}
                        alt={profile.displayName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Display Name:</span> {profile.displayName}
                  </div>
                  <div>
                    <span className="font-medium">City:</span> {profile.city}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`font-medium ${
                      profile.status === 'APPROVED' ? 'text-green-600' :
                      profile.status === 'PENDING' ? 'text-yellow-600' :
                      profile.status === 'REJECTED' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {profile.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Availability:</span> {profile.availabilityStatus}
                  </div>
                </div>
                <Link href="/dashboard/profile">
                  <Button>Edit Profile</Button>
                </Link>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You haven't created your driver profile yet. Create one to start connecting with passengers.
                </p>
                <Link href="/dashboard/profile">
                  <Button>Create Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
