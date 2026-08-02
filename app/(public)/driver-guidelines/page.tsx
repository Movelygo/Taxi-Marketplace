import { LegalPage, LegalSection } from '@/components/public/legal-page'

export const metadata = {
  title: 'Driver Guidelines | Movely',
  description: 'Community standards for drivers listed on Movely.',
}

const LAST_UPDATED = '2026-05-18'

export default function DriverGuidelinesPage() {
  return (
    <LegalPage
      title="Driver Guidelines"
      subtitle="Community standards every driver listed on Movely is expected to uphold."
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="Why these guidelines exist">
        <p>
          Movely is a directory built on trust. Customers come to us expecting honest information from real, professional drivers. These guidelines describe what we expect from every driver on the platform.
        </p>
      </LegalSection>

      <LegalSection title="Be honest in your profile">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Use your real name and a recent, clear photo of yourself.</li>
          <li>Accurately describe your vehicle type and the cities you actually serve.</li>
          <li>List only languages you can comfortably hold a conversation in.</li>
          <li>Keep your contact information current — phone and WhatsApp numbers must be ones you actively answer.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Operate legally">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Hold a valid driver&apos;s license appropriate for the vehicle and service you offer.</li>
          <li>Maintain current vehicle registration and any commercial / for-hire licensing required in your jurisdiction.</li>
          <li>Carry insurance that covers the type of trips you accept.</li>
        </ul>
        <p>
          Movely is a directory and does not verify these credentials. You are solely responsible for operating legally.
        </p>
      </LegalSection>

      <LegalSection title="Treat customers professionally">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Respond to inquiries promptly and politely.</li>
          <li>Be transparent about pricing before the trip begins.</li>
          <li>Keep your vehicle clean and in safe operating condition.</li>
          <li>Honor agreed pickup times.</li>
          <li>Treat every customer with respect, regardless of background.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Update your availability">
        <p>
          If you stop accepting bookings for a period, switch your status to <strong>Busy</strong> or <strong>Offline</strong>. This avoids wasting customer time and protects your reputation.
        </p>
      </LegalSection>

      <LegalSection title="Things that will get a profile removed">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Misrepresenting your identity, vehicle, or services.</li>
          <li>Using stock photos or images that are not of you.</li>
          <li>Repeated complaints about no-shows, unsafe driving, or unprofessional conduct.</li>
          <li>Using Movely to defraud or harass customers.</li>
          <li>Listing the same person under multiple profiles.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Verification (planned)">
        <p>
          Today, Movely does not perform background checks or document verification. We are exploring optional verification programs in future versions of the platform. Until that ships, no driver on Movely is &ldquo;verified&rdquo; by us, and we do not display verification badges.
        </p>
      </LegalSection>

      <LegalSection title="Reporting concerns">
        <p>
          Customers and drivers can report concerns by emailing{' '}
          <a href="mailto:hello@movelygo.com" className="text-[#0B1F3D] font-semibold hover:underline">
            hello@movelygo.com
          </a>
          . We review every report.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
