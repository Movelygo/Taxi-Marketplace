import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { DriverMetricsService } from '@/modules/drivers/services/driver-metrics.service'
import { ProfileCompletenessService } from '@/modules/drivers/services/profile-completeness.service'
import { DriverMetrics } from '@/components/dashboard/driver-metrics'
import { ProfileCompletenessCard } from '@/components/dashboard/profile-completeness-card'
import { OnboardingCallout, type CalloutTone } from '@/components/dashboard/onboarding-callout'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { 
  CheckCircle2, 
  MapPin, 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Search, 
  Edit3,
  Car
} from '@/components/ui/icons'
import Link from 'next/link'
import Image from 'next/image'
import type { Driver } from '@prisma/client'

export const dynamic = 'force-dynamic'

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

  // Get service area count for completeness scoring
  let serviceAreaCount = 0
  let serviceAreaNames: string[] = []
  if (profile) {
    const { prisma } = await import('@/lib/db/prisma')
    const areas = await prisma.serviceArea.findMany({
      where: { driverId: profile.id },
      select: { cityId: true, city: { select: { name: true } } },
    })
    serviceAreaCount = areas.length
    serviceAreaNames = areas.map(a => a.city.name)
  }

  const completeness = profile ? ProfileCompletenessService.evaluate(profile, serviceAreaCount) : null
  const metrics = profile ? await DriverMetricsService.getMetrics(profile.id) : null
  const callout = buildOnboardingCallout(profile, completeness?.percentage ?? 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <PageViewTracker
        eventName="dashboard_viewed"
        properties={{ has_profile: !!profile, profile_status: profile?.status }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10 space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              {profile ? `Hola, ${profile.displayName.split(' ')[0]}` : 'Welcome to Movely'}
            </h1>
            <p className="text-base font-medium text-gray-500 max-w-2xl leading-relaxed">
              {profile
                ? 'Manage your business profile and track your growth.'
                : 'Set up your driver profile to start connecting with customers.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {params.error === 'unauthorized' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <p className="font-bold text-sm">
              Acceso denegado: No tienes permisos para acceder al panel de administración.
            </p>
          </div>
        )}

        {/* Actionable Callouts Area */}
        <div className="space-y-4">
          {/* State-aware onboarding callout */}
          {callout && <OnboardingCallout {...callout} />}

          {/* Completeness card — only if profile exists and not yet 100% */}
          {profile && completeness && !completeness.isComplete && (
            <ProfileCompletenessCard completeness={completeness} />
          )}
        </div>

        {/* Stats Strip */}
        {profile && metrics && (
          <div className="space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Profile Performance</h2>
            <DriverMetrics
              profileViews={metrics.profileViews}
              totalLeads={metrics.totalLeads}
              whatsappLeads={metrics.whatsappLeads}
              callLeads={metrics.callLeads}
            />
          </div>
        )}

        {/* Main Grid: Profile & Account */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left: Driver Profile Summary */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0B1F3D]" />
                  <h2 className="text-xs font-black text-[#0B1F3D] uppercase tracking-[0.2em]">Business Profile</h2>
                </div>
                {completeness?.isComplete && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black uppercase tracking-wider border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </div>
                )}
              </div>
              <div className="p-6 lg:p-8 flex-1">
                {profile ? (
                  <ProfileSummary profile={profile} serviceAreaNames={serviceAreaNames} />
                ) : (
                  <NoProfileEmptyState />
                )}
              </div>
            </div>
          </div>

          {/* Right: Account Info & Quick Actions */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* Account Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-4 h-4 text-gray-400" />
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Account</h2>
              </div>
              
              <div className="space-y-5">
                <AccountRow icon={Mail} label="Email Address" value={user.email} />
                <AccountRow icon={Shield} label="Account Role" value={user.role === 'ADMIN' ? 'Administrator' : 'Verified Driver'} />
                <AccountRow 
                  icon={Calendar} 
                  label="Member Since" 
                  value={new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })} 
                />
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#0B1F3D] rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
              
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <QuickAction
                  href="/dashboard/profile"
                  title={profile ? 'Update profile' : 'Build profile'}
                  icon={Edit3}
                />
                {profile && profile.status === 'APPROVED' && (
                  <QuickAction
                    href={`/drivers/${profile.slug}`}
                    title="View as customer"
                    icon={Eye}
                  />
                )}
                <QuickAction
                  href="/drivers"
                  title="Browse directory"
                  icon={Search}
                />
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-black text-white/30 tracking-[0.2em] uppercase">
                <span>Movely Partner</span>
                <span>v1.2</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ---------- Internal Components ----------

function AccountRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, title, icon: Icon }: { href: string; title: string; icon: any }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-amber-400" />
        </div>
        <span className="font-bold text-sm tracking-tight">{title}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </Link>
  )
}

function ProfileSummary({ profile, serviceAreaNames }: { profile: Driver & { cityRel?: { name: string; state: string } | null }; serviceAreaNames?: string[] }) {
  const statusColor = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    APPROVED: 'bg-green-50 text-green-700 border-green-100',
    REJECTED: 'bg-red-50 text-red-700 border-red-100',
    SUSPENDED: 'bg-gray-100 text-gray-700 border-gray-200',
  }[profile.status]

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
      {/* Avatar & Status */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white bg-white shadow-xl">
          {profile.profileImageUrl ? (
            <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-[#0B1F3D] font-bold bg-gray-50">
              {profile.displayName.charAt(0)}
            </div>
          )}
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${statusColor}`}>
          {profile.status}
        </div>
      </div>

      {/* Primary Details */}
      <div className="flex-1 min-w-0 space-y-6 text-center sm:text-left">
        <div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{profile.displayName}</h3>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-gray-500 font-bold text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {profile.cityRel?.name || profile.city}
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              {profile.vehicleType}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-6 border-t border-gray-50 text-sm">
          <DetailRow label="Phone" value={profile.phone} />
          <DetailRow label="WhatsApp" value={profile.whatsappNumber} />
          <DetailRow label="Availability" value={profile.availabilityStatus === 'AVAILABLE' ? 'Online' : 'Offline'} />
          <DetailRow label="Service Area" value={(serviceAreaNames && serviceAreaNames.length > 0) ? serviceAreaNames.join(', ') : 'Not set'} truncate />
        </div>
        
        <div className="pt-6">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 text-[#0B1F3D] font-black text-sm hover:bg-gray-200 transition-all transform active:scale-95 shadow-sm"
          >
            Edit full profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, truncate = false }: { label: string; value: string | null; truncate?: boolean }) {
  return (
    <div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className={`font-bold text-gray-700 ${truncate ? 'truncate' : ''}`}>{value || '—'}</p>
    </div>
  )
}

function NoProfileEmptyState() {
  return (
    <div className="text-center py-10 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
        <Car className="w-8 h-8" />
      </div>
      <div className="max-w-xs mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight">Profile needed</h3>
        <p className="text-sm text-gray-500 font-medium">Create your profile to start receiving ride inquiries.</p>
      </div>
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0B1F3D] text-white font-black text-xs hover:bg-[#001F3F] transition-all transform active:scale-95 shadow-lg shadow-[#0B1F3D]/10"
      >
        Start building profile
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// ---------- Dashboard-specific build helpers ----------

function buildOnboardingCallout(
  profile: Driver | null,
  percentage: number,
): { tone: CalloutTone; title: string; description: string; eyebrow?: string; cta?: { label: string; href: string } } | null {
  if (!profile) {
    return {
      tone: 'action',
      eyebrow: 'Action Required',
      title: 'Get started: Create your profile',
      description: 'Your profile is how customers find and book you. It takes about 3 minutes to set up.',
      cta: { label: 'Start profile', href: '/dashboard/profile' },
    }
  }

  if (profile.status === 'PENDING') {
    return {
      tone: 'pending',
      eyebrow: 'Status: Pending Review',
      title: 'Your profile is being reviewed',
      description: 'Our team is reviewing your information. This typically takes 24-48 hours. You can still make edits while we review.',
      cta: { label: 'Edit while waiting', href: '/dashboard/profile' },
    }
  }

  if (profile.status === 'REJECTED') {
    return {
      tone: 'pending',
      eyebrow: 'Status: Action Needed',
      title: 'Profile approval was unsuccessful',
      description: 'Please review our guidelines and update your profile for resubmission.',
      cta: { label: 'Fix profile', href: '/dashboard/profile' },
    }
  }

  if (profile.status === 'APPROVED' && percentage < 100) {
    return {
      tone: 'info',
      eyebrow: 'Optimization Tip',
      title: 'Maximize your reach',
      description: 'Complete your remaining profile sections to appear higher in search results and build more trust.',
      cta: { label: 'Complete profile', href: '/dashboard/profile' },
    }
  }

  return null
}
