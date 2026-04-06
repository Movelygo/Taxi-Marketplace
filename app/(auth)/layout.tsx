import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Image
          src="/logo/logo.png"
          alt="Movely"
          width={150}
          height={40}
          priority
        />
      </Link>
      {children}
    </div>
  )
}
