import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { DriverMetricsService } from '@/modules/drivers/services/driver-metrics.service'
import { ProfileCompletenessService } from '@/modules/drivers/services/profile-completeness.service'
import { DriverMetrics } from '@/components/dashboard/driver-metrics'
import { ProfileCompletenessCard } from '@/components/dashboard/profile-completeness-card'
import { OnboardingCallout, type CalloutTone } from '@/components/dashboard/onboarding-callout'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { formatDriverStatus, formatAvailability } from '@/lib/format/driver'
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

  const completeness = profile ? ProfileCompletenessService.evaluate(profile) : null
  const metrics = profile ? await DriverMetricsService.getMetrics(profile.id) : null
  const callout = buildOnboardingCallout(profile, completeness?.percentage ?? 0)

  return (
    <div>
      <PageViewTracker
        eventName="dashboard_viewed"
        properties={{ has_profile: !!profile, profile_status: profile?.status }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Compact greeting (shell header already has brand + nav + sign out) */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile ? `Welcome, ${profile.displayName.split(' ')[0]}` : 'Welcome to Movely'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {profile
              ? 'Manage your driver profile and see how customers find you.'
              : 'Set up your driver profile to start connecting with customers.'}
          </p>
        </div>

        {/* Error Alert */}
        {params.error === 'unauthorized' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              You don&apos;t have permission to access the admin panel.
            </p>
          </div>
        )}

        {/* State-aware onboarding callout */}
        {callout && <OnboardingCallout {...callout} />}

        {/* Completeness card — only if profile exists and not yet 100% */}
        {profile && completeness && !completeness.isComplete && (
          <ProfileCompletenessCard completeness={completeness} />
        )}

        {/* Metrics — only if profile exists */}
        {profile && metrics && (
          <DriverMetrics
            profileViews={metrics.profileViews}
            totalLeads={metrics.totalLeads}
            whatsappLeads={metrics.whatsappLeads}
            callLeads={metrics.callLeads}
          />
        )}

        {/* Profile + Account row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Driver Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Driver Profile</h2>
              {completeness?.isComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </span>
              )}
            </div>
            <div className="p-6">
              {profile ? (
                <ProfileSummary profile={profile} />
              ) : (
                <NoProfileEmptyState />
              )}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Account</h2>
            </div>
            <div className="p-6 space-y-4">
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value={user.role.charAt(0) + user.role.slice(1).toLowerCase()} />
              <InfoRow
                label="Member since"
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                last
              />
            </div>
          </div>
        </div>

        {/* Quick Actions — consistent navy palette */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickAction
              href="/dashboard/profile"
              title={profile ? 'Edit profile' : 'Create profile'}
              description={profile ? 'Update your information' : 'Start your driver profile'}
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              }
            />
            {profile && profile.status === 'APPROVED' && (
              <QuickAction
                href={`/drivers/${profile.slug}`}
                title="View public profile"
                description="See how customers see you"
                icon={
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                }
              />
            )}
            <QuickAction
              href="/drivers"
              title="Browse directory"
              description="See other driver profiles"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Helpers ----------

function buildOnboardingCallout(
  profile: Driver | null,
  percentage: number,
): { tone: CalloutTone; title: string; description: string; eyebrow?: string; cta?: { label: string; href: string } } | null {
  if (!profile) {
    return {
      tone: 'action',
      eyebrow: 'Get started',
      title: 'Create your driver profile',
      description: 'Takes about 3 minutes. Once submitted, our team will review and approve your profile within 1–2 business days.',
      cta: { label: 'Start profile', href: '/dashboard/profile' },
    }
  }

  if (profile.status === 'PENDING') {
    return {
      tone: 'pending',
      eyebrow: 'Under review',
      title: 'Your profile is being reviewed',
      description: 'Our team typically approves new profiles within 1–2 business days. You can still edit your profile while it\'s under review.',
      cta: { label: 'Edit while waiting', href: '/dashboard/profile' },
    }
  }

  if (profile.status === 'REJECTED') {
    return {
      tone: 'pending',
      eyebrow: 'Action needed',
      title: 'Your profile was not approved',
      description: 'Please contact support to learn what needs to be updated before resubmission.',
      cta: { label: 'Contact support', href: '/contact' },
    }
  }

  if (profile.status === 'SUSPENDED') {
    return {
      tone: 'pending',
      eyebrow: 'Suspended',
      title: 'Your profile is currently suspended',
      description: 'Please contact support for details on how to restore your profile.',
      cta: { label: 'Contact support', href: '/contact' },
    }
  }

  // APPROVED states
  if (profile.status === 'APPROVED' && !profile.profileImageUrl) {
    return {
      tone: 'action',
      eyebrow: 'Next step',
      title: 'Add your profile photo',
      description: 'Profiles with a clear photo get significantly more customer contacts. This is the single most important thing you can do right now.',
      cta: { label: 'Upload photo', href: '/dashboard/profile' },
    }
  }

  if (profile.status === 'APPROVED' && percentage < 100) {
    return null // The completeness card itself handles this — no need for a redundant callout
  }

  if (profile.status === 'APPROVED' && percentage === 100) {
    return {
      tone: 'success',
      eyebrow: 'You\'re all set',
      title: 'Your profile is live and complete',
      description: 'Customers can find you in the public directory. Share your profile link to attract more leads.',
      cta: { label: 'View public profile', href: `/drivers/${profile.slug}` },
    }
  }

  return null
}

function ProfileSummary({ profile }: { profile: Driver }) {
  const statusInfo = formatDriverStatus(profile.status)
  const availabilityInfo = formatAvailability(profile.availabilityStatus)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#0B1F3D]/5">
          {profile.profileImageUrl ? (
            <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#0B1F3D] font-bold text-lg">
              {profile.displayName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{profile.displayName}</h3>
          <p className="text-sm text-gray-600">{profile.city}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Profile</p>
          <p
            className={`text-sm font-bold ${
              statusInfo.tone === 'positive'
                ? 'text-green-700'
                : statusInfo.tone === 'pending'
                  ? 'text-amber-700'
                  : statusInfo.tone === 'negative'
                    ? 'text-red-700'
                    : 'text-gray-700'
            }`}
          >
            {statusInfo.label}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Availability</p>
          <p
            className={`text-sm font-bold ${
              availabilityInfo.tone === 'available'
                ? 'text-green-700'
                : availabilityInfo.tone === 'busy'
                  ? 'text-amber-700'
                  : 'text-gray-700'
            }`}
          >
            {availabilityInfo.label}
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/profile"
        className="block w-full px-4 py-2.5 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold text-center hover:bg-[#001F3F] transition-colors"
      >
        Edit profile
      </Link>
    </div>
  )
}

function NoProfileEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[#0B1F3D]/5 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">No profile yet</h3>
      <p className="text-sm text-gray-600 mb-5 max-w-xs">
        You&apos;ll need to add your name, vehicle, contact info, and service area. Takes about 3 minutes.
      </p>
      <Link
        href="/dashboard/profile"
        className="px-5 py-2.5 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F] transition-colors"
      >
        Create profile
      </Link>
    </div>
  )
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 ${last ? '' : 'border-b border-gray-100'}`}>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#0B1F3D] hover:bg-gray-50 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center group-hover:bg-[#0B1F3D]/10 transition-colors flex-shrink-0">
        <svg className="w-5 h-5 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-600 truncate">{description}</p>
      </div>
    </Link>
  )
}
