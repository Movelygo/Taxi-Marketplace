import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DriverNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Driver Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            This driver profile is not available or has not been approved yet.
          </p>
          <Link href="/drivers" className="block">
            <Button className="w-full">Browse All Drivers</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
