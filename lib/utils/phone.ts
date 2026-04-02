/**
 * Format phone number for display
 * Simple US phone number formatting
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Validate US phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1')
}

/**
 * Format WhatsApp link
 */
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const url = `https://wa.me/${cleaned}`
  
  if (message) {
    return `${url}?text=${encodeURIComponent(message)}`
  }
  
  return url
}

/**
 * Format phone call link
 */
export function getPhoneCallLink(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  return `tel:+${cleaned}`
}
