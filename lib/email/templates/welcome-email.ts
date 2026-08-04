import {
  emailLayout,
  text,
  heading,
  buttonPrimary,
  link,
  callout,
  appUrl,
} from './layout'

export function buildWelcomeEmailHtml(_user: {
  email: string
}): string {
  const dashboardUrl = appUrl('/dashboard')
  const driversUrl = appUrl('/drivers')
  const guidelinesUrl = appUrl('/driver-guidelines')

  const body = [
    text(`Welcome to <strong>Movely</strong> — we're glad to have you on board.`),

    text(
      'Movely is a directory that connects independent drivers with customers looking for transportation. Here\'s what you can do right now:',
    ),

    heading('Build your profile'),
    text(
      'Your profile is your business card on Movely. Add your vehicle details, service areas, amenities, and photos to attract more customers.',
    ),

    buttonPrimary(dashboardUrl, 'Go to your dashboard'),

    callout(
      'Profiles with vehicle photos get up to 50% more views. Upload your gallery after creating your profile.',
      'info',
    ),

    heading('What makes a great profile?'),
    text(
      '• Use a clear profile photo and at least one vehicle photo<br>' +
      '• List your service areas and operating hours<br>' +
      '• Add amenities like A/C, Wi-Fi, or airport service<br>' +
      '• Keep your availability status updated',
    ),

    link(guidelinesUrl, 'Read our driver guidelines'),
    text(''),

    heading('Browse other drivers'),
    text(
      `See how other drivers present themselves on the ${link(driversUrl, 'public directory')}.`,
    ),

    text(
      'Questions? Reply to this email or contact us at hello@movelygo.com. We typically respond within 24 hours.',
    ),
  ].join('')

  return emailLayout({
    preheader: 'Welcome to Movely — start building your driver profile today.',
    headerTitle: 'Welcome to Movely',
    headerSubtitle: 'Your driver journey starts here',
    body,
  })
}

export function buildWelcomeEmailText(_user: {
  email: string
}): string {
  const dashboardUrl = appUrl('/dashboard')
  const driversUrl = appUrl('/drivers')
  const guidelinesUrl = appUrl('/driver-guidelines')

  return `Welcome to Movely

Welcome to Movely — we're glad to have you on board.

Movely is a directory that connects independent drivers with customers looking for transportation. Here's what you can do right now:

BUILD YOUR PROFILE
Your profile is your business card on Movely. Add your vehicle details, service areas, amenities, and photos to attract more customers.

Go to your dashboard: ${dashboardUrl}

Profiles with vehicle photos get up to 50% more views. Upload your gallery after creating your profile.

WHAT MAKES A GREAT PROFILE?
- Use a clear profile photo and at least one vehicle photo
- List your service areas and operating hours
- Add amenities like A/C, Wi-Fi, or airport service
- Keep your availability status updated

Read our driver guidelines: ${guidelinesUrl}

BROWSE OTHER DRIVERS
See how other drivers present themselves on the public directory: ${driversUrl}

Questions? Reply to this email or contact us at hello@movelygo.com. We typically respond within 24 hours.

Movely — Driver-customer connection platform
hello@movelygo.com`
}
