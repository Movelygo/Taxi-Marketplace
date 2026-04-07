'use client'

import { Button } from '@/components/ui/button'
import { trackLead } from '@/modules/leads/actions/track-lead'

interface LeadTrackingButtonsProps {
  driverId: string
  whatsappLink: string
  phoneLink: string
  driverName: string
}

export function LeadTrackingButtons({ 
  driverId, 
  whatsappLink, 
  phoneLink,
  driverName 
}: LeadTrackingButtonsProps) {
  const handleWhatsAppClick = async () => {
    await trackLead(driverId, 'WHATSAPP')
    window.open(whatsappLink, '_blank')
  }

  const handleCallClick = async () => {
    await trackLead(driverId, 'CALL')
    window.location.href = phoneLink
  }

  return (
    <div className="flex gap-3">
      <Button 
        onClick={handleWhatsAppClick}
        size="lg" 
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        📱 WhatsApp {driverName}
      </Button>
      <Button 
        onClick={handleCallClick}
        size="lg" 
        variant="outline" 
        className="flex-1"
      >
        📞 Call {driverName}
      </Button>
    </div>
  )
}
