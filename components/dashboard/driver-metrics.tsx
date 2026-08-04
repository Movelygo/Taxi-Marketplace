import { Eye, Users, MessageCircle, Phone } from '@/components/ui/icons'

interface DriverMetricsProps {
  profileViews: number
  totalLeads: number
  whatsappLeads: number
  callLeads: number
}

export function DriverMetrics({ profileViews, totalLeads, whatsappLeads, callLeads }: DriverMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Profile Views Card */}
      <MetricCard
        label="Profile Views"
        value={profileViews}
        description="Total visitors to your profile"
        icon={Eye}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />

      {/* Total Leads Card */}
      <MetricCard
        label="Total Leads"
        value={totalLeads}
        description="All customer contact attempts"
        icon={Users}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />

      {/* WhatsApp Leads Card */}
      <MetricCard
        label="WhatsApp"
        value={whatsappLeads}
        description="Contacts via WhatsApp"
        icon={MessageCircle}
        iconBg="bg-green-50"
        iconColor="text-green-600"
      />

      {/* Call Leads Card */}
      <MetricCard
        label="Phone Calls"
        value={callLeads}
        description="Contacts via phone call"
        icon={Phone}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  description, 
  icon: Icon, 
  iconBg, 
  iconColor 
}: { 
  label: string
  value: number
  description: string
  icon: any
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <h3 className="text-xl font-black text-gray-900 leading-none">{value}</h3>
        </div>
      </div>
      <p className="text-[10px] font-medium text-gray-500 leading-tight">{description}</p>
    </div>
  )
}
