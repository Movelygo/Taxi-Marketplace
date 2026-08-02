import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingClasses = {
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
}

export function Section({ 
  children, 
  className,
  spacing = 'md'
}: SectionProps) {
  return (
    <section className={cn(
      spacingClasses[spacing],
      className
    )}>
      {children}
    </section>
  )
}
