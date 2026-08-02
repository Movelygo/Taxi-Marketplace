interface StatusPillProps {
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  size?: 'sm' | 'md'
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  AVAILABLE:  { label: 'Online Now',    classes: 'bg-green-100 text-green-800' },
  BUSY:       { label: 'Busy',          classes: 'bg-amber-100 text-amber-800' },
  OFFLINE:    { label: 'Offline',       classes: 'bg-gray-100 text-gray-600'   },
  PENDING:    { label: 'Pending',       classes: 'bg-amber-100 text-amber-800' },
  APPROVED:   { label: 'Active',        classes: 'bg-blue-100 text-blue-800'   },
  REJECTED:   { label: 'Rejected',      classes: 'bg-red-100 text-red-800'     },
  SUSPENDED:  { label: 'Suspended',     classes: 'bg-red-100 text-red-800'     },
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const { label, classes } = STATUS_MAP[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' }
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${classes}`}>
      {label}
    </span>
  )
}
