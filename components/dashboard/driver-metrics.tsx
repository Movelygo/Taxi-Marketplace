import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DriverMetricsProps {
  profileViews: number
  totalLeads: number
  whatsappLeads: number
  callLeads: number
}

export function DriverMetrics({ profileViews, totalLeads, whatsappLeads, callLeads }: DriverMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Profile Views</CardDescription>
          <CardTitle className="text-3xl">{profileViews}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">Total profile visits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Leads</CardDescription>
          <CardTitle className="text-3xl">{totalLeads}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">Contact attempts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>WhatsApp Leads</CardDescription>
          <CardTitle className="text-3xl text-green-600">{whatsappLeads}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">Via WhatsApp</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Call Leads</CardDescription>
          <CardTitle className="text-3xl text-blue-600">{callLeads}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">Via phone call</p>
        </CardContent>
      </Card>
    </div>
  )
}
