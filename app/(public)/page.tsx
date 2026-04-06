import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-8">
        <Image
          src="/logo/logo.png"
          alt="Movely"
          width={200}
          height={60}
          priority
          className="mx-auto"
        />
        
        <h1 className="text-4xl font-bold tracking-tight">
          Connect with trusted taxi drivers
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Find local taxi drivers in the Maryland/Baltimore/DC area
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/drivers">
            <Button size="lg" className="w-full sm:w-auto">Browse Drivers</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">Driver Sign Up</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
