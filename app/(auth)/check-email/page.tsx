import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Check Your Email | Movely',
  description: 'Confirm your email address to activate your account'
}

export default function CheckEmailPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We've sent a confirmation link to your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to activate your account, then return here to sign in.
        </p>
        
        <Link href="/login" className="w-full">
          <Button className="w-full">Return to sign in</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
